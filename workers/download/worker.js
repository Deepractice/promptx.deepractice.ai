/**
 * PromptX Download Worker - File download and version management
 *
 * Features:
 * - /download/latest/xxx.exe - Auto redirect to latest version
 * - /download/1.23.1/xxx.exe - Specific version download
 * - /download/ - Version list
 * - /download/1.23.1/ - Version file list with download stats
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(p => p);

    // Root path
    if (pathParts.length === 0) {
      return new Response('PromptX Worker - Use /download/ for releases', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // /download path
    if (pathParts[0] === 'download') {
      return handleDownload(request, env, pathParts.slice(1));
    }

    // /stats path - Download statistics
    if (pathParts[0] === 'stats') {
      return handleStats(request, env);
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function handleDownload(request, env, pathParts) {
  const bucket = env.PROMPTX_RELEASES;

  if (!bucket) {
    return new Response('R2 bucket not configured', { status: 500 });
  }

  // /download/ - List all versions
  if (pathParts.length === 0) {
    return listVersions(bucket);
  }

  const version = pathParts[0];
  const fileName = pathParts.slice(1).join('/');

  // /download/latest/ - Smart redirect to latest version
  if (version === 'latest') {
    const latestVersion = await getLatestVersion(bucket);
    if (!latestVersion) {
      return new Response('No releases found', { status: 404 });
    }

    // If filename doesn't include version, add it automatically
    let actualFileName = fileName;
    if (fileName && !fileName.includes(latestVersion)) {
      // Pattern: promptx-desktop-{platform}-{arch}.{ext}
      // Convert to: promptx-desktop-{version}-{platform}-{arch}.{ext}
      actualFileName = fileName.replace(/^(promptx-desktop-)/, `$1${latestVersion}-`);
    }

    const redirectUrl = `/download/${latestVersion}/${actualFileName}`;
    return Response.redirect(new URL(redirectUrl, request.url).href, 302);
  }

  // /download/{version}/ - List version files
  if (!fileName) {
    return listVersionFiles(bucket, version, env);
  }

  // /download/{version}/{file} - Download file
  const objectKey = `${version}/${fileName}`;
  const object = await bucket.get(objectKey);

  if (!object) {
    return new Response(`File not found: ${objectKey}`, { status: 404 });
  }

  // Record download statistics (using KV counter)
  if (env.DOWNLOAD_STATS) {
    const key = objectKey; // version/fileName
    try {
      const currentCount = await env.DOWNLOAD_STATS.get(key);
      const newCount = currentCount ? parseInt(currentCount) + 1 : 1;
      await env.DOWNLOAD_STATS.put(key, newCount.toString());
    } catch (e) {
      // Stat failure doesn't affect download
      console.error('Failed to record download stats:', e);
    }
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
}

// Get latest version number
async function getLatestVersion(bucket) {
  const listed = await bucket.list({ delimiter: '/' });

  if (!listed.delimitedPrefixes.length) {
    return null;
  }

  // Version sorting (semantic versioning)
  const versions = listed.delimitedPrefixes
    .map(p => p.replace('/', ''))
    .filter(v => /^\d+\.\d+\.\d+/.test(v))
    .sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
      const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
      if (aMajor !== bMajor) return bMajor - aMajor;
      if (aMinor !== bMinor) return bMinor - aMinor;
      return bPatch - aPatch;
    });

  return versions[0] || null;
}

// List all versions
async function listVersions(bucket) {
  const listed = await bucket.list({ delimiter: '/' });

  const versions = listed.delimitedPrefixes
    .map(p => p.replace('/', ''))
    .filter(v => /^\d+\.\d+\.\d+/.test(v))
    .sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
      const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
      if (aMajor !== bMajor) return bMajor - aMajor;
      if (aMinor !== bMinor) return bMinor - aMinor;
      return bPatch - aPatch;
    });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PromptX Downloads</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 2rem; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { margin-bottom: 2rem; color: #333; font-size: 2rem; }
    .latest { background: #f8f9fa; border-left: 4px solid #0066cc; padding: 1.25rem; margin-bottom: 2rem; }
    .latest-version { font-size: 1.1rem; font-weight: 600; color: #333; }
    .latest-version a { color: #0066cc; text-decoration: none; }
    .latest-version a:hover { text-decoration: underline; }
    h2 { font-size: 1.25rem; margin-bottom: 1rem; color: #666; }
    .list { list-style: none; }
    .list li { padding: 0.75rem; border-bottom: 1px solid #eee; }
    .list li:hover { background: #f9f9f9; }
    .list a { text-decoration: none; color: #0066cc; }
    .list a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📦 PromptX Downloads</h1>
    ${versions.length > 0 ? `
      <div class="latest">
        <div class="latest-version">Latest: <a href="/download/${versions[0]}/">${versions[0]}</a></div>
      </div>
    ` : ''}
    <h2>All Versions</h2>
    <ul class="list">
      ${versions.map(v => `
        <li><a href="/download/${v}/">v${v}</a></li>
      `).join('')}
    </ul>
  </div>
</body>
</html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// List version files
async function listVersionFiles(bucket, version, env) {
  const listed = await bucket.list({ prefix: `${version}/` });

  // Get download statistics (using KV storage)
  const stats = {};
  if (env.DOWNLOAD_STATS) {
    for (const obj of listed.objects) {
      const fileName = obj.key.replace(`${version}/`, '');
      const key = `${version}/${fileName}`;
      const count = await env.DOWNLOAD_STATS.get(key);
      stats[fileName] = count ? parseInt(count) : 0;
    }
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PromptX v${version}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 2rem; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { margin-bottom: 1rem; color: #333; }
    .back { margin-bottom: 1rem; }
    .back a { color: #0066cc; text-decoration: none; }
    .list { list-style: none; }
    .list li { padding: 0.75rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .list li:hover { background: #f9f9f9; }
    .list a { text-decoration: none; color: #0066cc; flex: 1; }
    .meta { color: #999; font-size: 0.85rem; margin-left: 1rem; display: flex; gap: 1rem; align-items: center; }
    .downloads { color: #0066cc; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="back"><a href="/download/">← All Versions</a></div>
    <h1>📦 PromptX v${version}</h1>
    <ul class="list">
      ${listed.objects.map(obj => {
        const fileName = obj.key.replace(`${version}/`, '');
        const size = formatSize(obj.size);
        const downloads = stats[fileName] || 0;
        return `
          <li>
            <a href="/download/${obj.key}">${fileName}</a>
            <span class="meta">
              <span class="downloads">↓ ${downloads.toLocaleString()}</span>
              <span>${size}</span>
            </span>
          </li>
        `;
      }).join('')}
    </ul>
  </div>
</body>
</html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function handleStats(request, env) {
  if (!env.DOWNLOAD_STATS) {
    return new Response('Stats not configured', { status: 500 });
  }

  // Get all stats keys
  const list = await env.DOWNLOAD_STATS.list();
  const stats = {};

  for (const key of list.keys) {
    const count = await env.DOWNLOAD_STATS.get(key.name);
    stats[key.name] = parseInt(count) || 0;
  }

  return new Response(JSON.stringify(stats, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}

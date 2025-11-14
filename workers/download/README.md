# PromptX Download Worker

Cloudflare Worker for managing PromptX desktop app downloads with version management and download statistics.

## Features

### 1. Auto Redirect to Latest Version
```
https://promptx.deepractice.ai/download/latest/promptx-desktop-setup.exe
→ Auto redirects to
https://promptx.deepractice.ai/download/1.27.1/promptx-desktop-1.27.1-win32-x64-setup.exe
```

### 2. Specific Version Download
```
https://promptx.deepractice.ai/download/1.27.1/promptx-desktop-1.27.1-win32-x64-setup.exe
```

### 3. Version List
```
https://promptx.deepractice.ai/download/
```
Shows all available versions, sorted by semantic versioning.

### 4. Version File List (with download stats)
```
https://promptx.deepractice.ai/download/1.27.1/
```
Shows all files for a specific version, including:
- File size
- Download count (real-time statistics)

## Electron AutoUpdater Configuration

Use in `electron-builder.yml`:

```yaml
publish:
  - provider: generic
    url: https://promptx.deepractice.ai/download/latest
```

The Worker will automatically redirect `/download/latest/` to the latest version.

## Deployment

### Prerequisites

1. Install Wrangler CLI:
```bash
npm install -g wrangler
# or
pnpm add -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

### Manual Deployment

```bash
cd workers/download
wrangler deploy
```

### Automatic Deployment

Commits to the `main` branch automatically trigger deployment via GitHub Actions (if configured).

## Binding Custom Domain

In Cloudflare Dashboard:

1. Go to **Workers & Pages** → **promptx-download-manager** → **Settings** → **Triggers**
2. Click **Custom Domains** → **Add Custom Domain**
3. Enter: `promptx.deepractice.ai`
4. Add route pattern: `/download/*/*`

## Download Statistics

Real-time download statistics are stored using Cloudflare KV.

### Setup KV Namespace

```bash
# Create KV namespace
wrangler kv:namespace create "DOWNLOAD_STATS"

# Output will show namespace ID, copy it to wrangler.toml
# Replace: id = "YOUR_KV_NAMESPACE_ID"
```

### View Statistics

Visit a specific version page to see download counts for each file:
```
https://promptx.deepractice.ai/download/1.27.1/
```

Or get raw JSON stats:
```
https://promptx.deepractice.ai/stats
```

## Local Development

```bash
cd workers/download
wrangler dev
```

Visit: `http://localhost:8787/download/`

## Architecture

This Worker works alongside the main Next.js website:

```
promptx.deepractice.ai
│
├─ / → Next.js static site (Cloudflare Pages)
│  ├─ /download → Download landing page (static)
│  ├─ /docs → Documentation (static)
│  └─ / → Homepage (static)
│
└─ /download/* → Cloudflare Worker (this)
   ├─ /download/latest/xxx → Dynamic redirect
   ├─ /download/1.27.1/xxx → File download from R2
   └─ /download/1.27.1/ → Version file list
```

## Environment Variables

Configured in `wrangler.toml`:

- `PROMPTX_RELEASES` - R2 bucket binding for release files
- `DOWNLOAD_STATS` - KV namespace binding for download statistics

## File Naming Convention

Files in R2 bucket should follow this structure:

```
promptx-releases/
├─ 1.27.1/
│  ├─ promptx-desktop-1.27.1-mac-arm64.dmg
│  ├─ promptx-desktop-1.27.1-mac-x64.dmg
│  ├─ promptx-desktop-1.27.1-win32-x64-setup.exe
│  ├─ promptx-desktop-1.27.1-linux-x64.deb
│  └─ ...
├─ 1.27.0/
│  └─ ...
```

Version folders must use semantic versioning: `{major}.{minor}.{patch}`

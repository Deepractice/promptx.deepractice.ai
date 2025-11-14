# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the official website and documentation for PromptX - an AI Agent Context Platform. Built with Next.js 14 and Nextra 3, this is a static documentation site deployed to Cloudflare Pages.

**Tech Stack:**
- Next.js 14 with static export
- Nextra 3 (documentation framework with MDX)
- TypeScript
- Tailwind CSS
- React 18

## Development Commands

```bash
# Start development server (runs on port 3025)
npm run dev
# or
pnpm dev

# Build static site (output to ./out directory)
npm run build
# or
pnpm build

# Lint code
npm run lint

# Lint and auto-fix
npm run lint:fix

# Clean build artifacts and dependencies
npm run clean
```

**Note:** The dev server runs on port 3025 (not the default 3000).

## Project Architecture

### Static Site Generation

This site uses Next.js static export (`output: 'export'` in next.config.mjs). All pages are pre-rendered at build time into the `out` directory. This means:
- No server-side runtime required
- Can be deployed to static hosting (Cloudflare Pages, GitHub Pages, etc.)
- Images must be unoptimized (`unoptimized: true`)
- No API routes or dynamic server features

### Content Structure

**Pages (MDX + TSX):**
- `pages/index.tsx` - Home page (custom React component)
- `pages/download.tsx` - Download page
- `pages/docs/*.mdx` - Documentation content in MDX format
- `pages/_app.tsx` - Next.js app wrapper
- `pages/_meta.ts` - Page metadata and navigation structure

**Components:**
- `components/Header.tsx` - Site header with navigation
- `components/Footer.tsx` - Site footer
- `components/InteractiveDemo.tsx` - Interactive demo component for home page
- `components/FeatureCard.tsx` - Feature card component
- `components/PlaygroundDemo.tsx` - Playground demo component
- `components/OSIcons.tsx` - Operating system icons

### Theme Configuration

**`theme.config.tsx`** is the central Nextra theme configuration. It controls:
- Site logo and branding
- Navigation structure
- Dark mode settings (currently disabled, defaultTheme: 'light')
- Footer content
- SEO metadata
- Sidebar behavior
- Primary colors (hue: 210, saturation: 80)

Key theme settings:
- Dark mode is disabled (`darkMode: false`)
- Primary color is blue (210 hue)
- Sidebar has default collapse level of 1
- Edit links point to GitHub repository

### Design System

**Tailwind Configuration** (`tailwind.config.js`):

**Custom Color Scheme:**
- `rational.*` - Cold/rational colors (deep blue, slate) for logical elements
- `primary.*` - Primary blue colors (Monogent style, main: #2C3E50)
- `creative.*` - Warm/creative colors (amber gold, main: #F39C12) for creative elements
- `background.*` - Subtle gray variations for section backgrounds

**Custom Gradients:**
- `bg-gradient-cold-warm` - Blue to brown gradient
- `bg-gradient-warm-purple` - Orange to purple gradient

The design philosophy combines cold colors (rational/compute) with warm colors (creative/generate) to represent the dual nature of AI systems.

### Nextra Integration

Nextra wraps Next.js and provides:
- MDX support for documentation pages
- Built-in search functionality
- Automatic navigation from file structure
- Code highlighting with copy buttons
- LaTeX support (enabled via `latex: true`)
- Default copy code button (enabled via `defaultShowCopyCode: true`)

The `withNextra()` wrapper in `next.config.mjs` applies these capabilities.

## Deployment

This project has two deployment targets on the same domain:

1. **Cloudflare Pages** - Static website (Next.js)
2. **Cloudflare Worker** - Download service (in `workers/download/`)

### Architecture Overview

```
promptx.deepractice.ai
│
├─ / → Cloudflare Pages (Next.js static site)
│  ├─ /download → Download landing page (static)
│  ├─ /docs → Documentation (static)
│  └─ / → Homepage (static)
│
└─ /download/* → Cloudflare Worker
   ├─ /download/latest/xxx → Dynamic redirect to latest version
   ├─ /download/1.27.1/xxx → File download from R2
   └─ /download/1.27.1/ → Version file list with stats
```

### Deploy Website (Cloudflare Pages)

**Option 1: Automatic GitHub Deployment (Recommended)**

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. Click "Create a project" → "Connect to Git"
3. Select your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build` or `pnpm build`
   - **Build output directory**: `out`
   - **Root directory**: `/`
   - **Environment variable**: `NODE_VERSION=18.17.0`
5. Click "Save and Deploy"

After setup, every push to `main` triggers automatic deployment.

**Option 2: Manual Deployment with Wrangler**

```bash
# Build the site
npm run build

# Deploy to Cloudflare Pages
npm run deploy:pages
# or manually:
wrangler pages deploy out --project-name=promptx
```

### Deploy Download Worker

```bash
# Deploy worker only
npm run worker:deploy

# Or manually:
cd workers/download
wrangler deploy
```

### Deploy Both (Complete Deployment)

```bash
npm run deploy:all
```

This will:
1. Build the Next.js static site
2. Deploy to Cloudflare Pages
3. Deploy the download worker

### Worker Route Configuration

After deploying the worker, configure the route in Cloudflare Dashboard:

1. Go to **Workers & Pages** → **promptx-worker** → **Settings** → **Triggers**
2. Add **Custom Domain**: `promptx.deepractice.ai`
3. Add **Route**: `/download/*/*`

This ensures the worker handles all `/download/*/*` paths while Pages handles everything else.

### Build Behavior

The build configuration includes:
- `ignoreDuringBuilds: true` for ESLint (to prevent build failures on warnings)
- `ignoreBuildErrors: true` for TypeScript (to allow deployment with type warnings)
- `unoptimized: true` for images (required for static export)

These settings prioritize successful builds over strict type/lint checking during deployment.

## Content Management

### Adding Documentation Pages

1. Create an MDX file in `pages/docs/`
2. Add metadata in `pages/docs/_meta.ts` to control navigation
3. Use MDX syntax for content (Markdown + React components)

### Navigation Structure

Navigation is controlled by `_meta.ts` files:
- `pages/_meta.ts` - Top-level navigation
- `pages/docs/_meta.ts` - Documentation section navigation

## Development Notes

### Port Configuration

The dev server runs on port 3025 (configured in package.json) to avoid conflicts with other local services.

### Node Version

This project requires Node.js >= 18.17.0 (specified in package.json engines and .node-version).

### Styling Approach

The site combines:
- Tailwind utility classes for layout and styling
- Custom color tokens from the design system
- Inline styles where necessary (e.g., padding-bottom for video aspect ratio)

### Video Embeds

The home page includes a YouTube embed with specific settings:
- 16:9 aspect ratio using padding-bottom hack
- HD quality parameter (`vq=hd720`)
- Standard YouTube embed permissions

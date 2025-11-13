# PromptX Website

Official website and documentation for PromptX - AI Agent Context Platform.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **Nextra 3** - Documentation site generator with MDX support
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development

## Design System

### Color Palette

**Cold Colors (Rational/Compute)**
- Primary: Sky blue (#0EA5E9)
- Background: Slate (#0F172A)
- Text: Light slate (#E2E8F0)

**Warm Colors (Creative/Generate)**
- Primary: Orange (#F97316)
- Accent: Purple (#A855F7)
- Glow: Amber (#FCD34D)

### Visual Concept

The design combines cold and warm colors to represent:
- **Cold** (Blue/Cyan) → Rationality, Computation, Logic
- **Warm** (Orange/Purple) → Creativity, Generation, Innovation

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start dev server
cd apps/website
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Project Structure

```
apps/website/
├── pages/              # Pages and MDX content
│   ├── index.mdx       # Home page
│   ├── docs/           # Documentation
│   ├── playground.mdx  # Interactive playground
│   └── _app.tsx        # Next.js app wrapper
├── components/         # React components
│   ├── InteractiveDemo.tsx
│   ├── FeatureCard.tsx
│   └── PlaygroundDemo.tsx
├── styles/            # Global styles
│   └── globals.css
├── public/            # Static assets
├── theme.config.tsx   # Nextra theme configuration
├── next.config.mjs    # Next.js configuration
└── tailwind.config.js # Tailwind configuration
```

## Features

### Home Page
- Hero section with gradient background
- Interactive demo component
- Feature cards
- Call-to-action sections

### Documentation
- MDX-powered documentation
- Code highlighting with copy button
- Search functionality
- Dark mode support

### Playground
- Interactive scenario demonstrations
- Role activation examples
- Memory system exploration
- Tool usage examples

## Deployment

### Cloudflare Pages (Recommended)

Deployed to Cloudflare Pages for free unlimited hosting.

**Automatic Deployment:**
1. Connect your GitHub repository to Cloudflare Pages
2. Set build configuration:
   - **Build command**: `cd apps/website && pnpm build`
   - **Build output directory**: `apps/website/out`
   - **Root directory**: `/` (monorepo root)
   - **Node version**: 18.17.0 (detected from `.node-version`)

**Manual Deployment:**
```bash
# Build the static site
cd apps/website
pnpm build

# Install Wrangler CLI
pnpm add -g wrangler

# Deploy to Cloudflare Pages
wrangler pages deploy out --project-name=promptx
```

### Static Export

This site uses Next.js static export (`output: 'export'`) which generates a fully static site in the `out` directory. All pages are pre-rendered at build time.

### Environment Variables

No environment variables required for deployment.

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## License

MIT License - see [LICENSE](../../LICENSE) for details.

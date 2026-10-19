# 13axis Ecommerce

A basic e-commerce storefront concept for learning and experimenting with modern
web development. The project uses a small, local sample catalog of T-shirts to
explore shopping journeys and, especially, Next.js concepts such as caching and
the differences between Server and Client Components.

<img width="1072" height="932" alt="Storefront screenshot" src="https://github.com/user-attachments/assets/a1923126-592a-4f89-94b9-f6bea49a8339" />

This is a learning project, not a production store. The catalog is hard-coded,
and there is no product API, database, authentication, real cart persistence,
checkout, payment processing, inventory, shipping, or order management. The
cart counter is local demo state.

## What You Can Explore

- Product discovery through a responsive storefront and filterable catalog.
- Localized product detail pages with image, price, size selection, and related
  products.
- The Next.js App Router and localized routes.
- Server and Client Component boundaries: route-level product lookup and
  not-found handling are server-rendered, while interactive product selection
  and the demo cart use client-side state.
- Next.js rendering and caching behavior. Use this project to investigate how
  route rendering, data sources, and caching strategies affect freshness and
  performance. Since the current catalog is static local data, it does not
  demonstrate fetching or caching data from a live backend.

## Technology

- Next.js 15 with the App Router
- React 18 and TypeScript
- `next-intl` for localization
- Tailwind CSS 4
- Jest and Testing Library
- Playwright for end-to-end tests
- Nx monorepo with pnpm workspaces

## Requirements

- Node.js `20.17.0` (see `.nvmrc`)
- pnpm `9.15.9`
- Docker and Docker Compose (optional)

Install pnpm and the project dependencies from the repository root:

```bash
npm install --global pnpm@9.15.9
pnpm install --frozen-lockfile
```

## Local Development

The storefront is the `storefront` Nx project under `apps/storefront`. Start it
from the repository root:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Portuguese (Brazil) is the
default locale at `/br`; English (United States) is available at `/us`.

You can also run an Nx target directly:

```bash
pnpm nx show projects
pnpm nx run storefront:dev
```

Application targets are available as root shortcuts, including `pnpm build`,
`pnpm start`, `pnpm test`, `pnpm lint`, and `pnpm typecheck`. Add future
applications as separate projects under `apps/` (for example, an admin
application) and define their Nx targets in their own `project.json`.

## Project Structure

```text
apps/
  storefront/
    src/
      app/[locale]/            Localized App Router pages and layouts
      components/              Shared UI and storefront components
      i18n/                    Locale routing and translation messages
      lib/                     Sample product data and demo cart state
      styles/                  Global styles and theme tokens
    project.json               Nx targets for the storefront
nx.json                        Shared Nx configuration
pnpm-workspace.yaml            pnpm workspace definition
```

## Styling and Theme

Tailwind CSS utility classes are available throughout the application:

```tsx
<div className="flex items-center gap-4 p-4">Content</div>
```

The default visual theme uses a neutral grayscale palette. Its CSS variables
are defined in `apps/storefront/src/styles/globals.css` and exposed to Tailwind
through `@theme inline`. The `--background`, `--foreground`, `--primary`,
`--muted`, `--border`, `--input`, and `--ring` tokens support light and dark
themes. Update the values in `:root` and `.dark` to adjust the palette.

The hero carousel uses the theme tokens and the slides in
`apps/storefront/public/hero-slide-*.svg`. It advances every five seconds and
adapts to mobile and larger screens.

## Generate a Component

Create a component in `apps/storefront/src/components` with an implementation,
test, and barrel export:

```bash
pnpm create:component ComponentName
```

Use PascalCase with letters and numbers. The generator does not overwrite an
existing component directory.

## Tests and Checks

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm test:e2e
```

Playwright uses Chromium. Install the browser before the first end-to-end test
run:

```bash
pnpm exec playwright install chromium
```

## Production Build

```bash
pnpm build
pnpm start
```

The production build uses Next.js output optimized for deployment. The
production Docker image uses standalone output. On Windows, the local build
uses the default Next.js output to avoid requiring special symbolic-link
permissions.

## Docker

Start the development environment with hot reload:

```bash
docker compose up --build
```

Build and run the production container:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

In either case, the application is available at
[http://localhost:3000](http://localhost:3000). Stop the production environment
with:

```bash
docker compose -f docker-compose.prod.yml down
```

## Storybook

Start the Storybook development server:

```bash
pnpm storybook
```

Build the static Storybook:

```bash
pnpm build-storybook
```

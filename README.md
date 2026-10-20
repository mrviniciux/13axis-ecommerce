# 13axis Ecommerce

A basic e-commerce storefront concept for learning and experimenting with modern
web development. The project uses a small, local sample catalog of T-shirts to
explore shopping journeys and, especially, Next.js concepts such as caching and
the differences between Server and Client Components.

<img width="1072" height="932" alt="Storefront screenshot" src="https://github.com/user-attachments/assets/a1923126-592a-4f89-94b9-f6bea49a8339" />

This is a learning project, not a production store. The storefront catalog and
cart counter remain demo data. The administrative area uses MySQL for accounts,
products, inventory balances, and an auditable stock movement ledger. Sales
figures on its dashboard are illustrative, not connected to orders or payments.

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

The standalone `pnpm dev` command starts Next.js only. The admin routes also
require a reachable MySQL database, applied Prisma migrations, and `AUTH_SECRET`.
Use the Docker Compose setup below for a complete local environment; it starts
the database and storefront together.

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

Copy `.env.example` to `.env`, change the local database passwords, and leave
`ADMIN_EMAIL` blank for unrestricted first-user bootstrap in local development.
Start the development environment with hot reload; Compose starts MySQL, applies
versioned migrations, then starts the storefront:

```bash
docker compose up --build
```

On local Compose, the first registration at `/restrict/admin/login` becomes the
administrator; later registrations do not receive administrative access. In
production, set `ADMIN_EMAIL` to the intended administrator before startup;
only that address can claim the first account, including through Google. Google
sign-in is optional; configure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in
`.env` and register `http://localhost:3000/api/auth/callback/google` as the
OAuth callback in Google Cloud. Use a unique `AUTH_SECRET` outside local
development.

Product variants have unique SKUs and optional barcodes, cost and sale prices,
attributes, and a linked inventory balance. Stock counts track physical units,
reservations, and reorder points separately; every manual adjustment requires
a reason and creates an auditable movement record. Integration channels and
external SKU/product mappings are modeled for future marketplace sync. No
external platform is connected yet.

Production requires `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `AUTH_SECRET`, and
`ADMIN_EMAIL` in `.env`; replace the example admin address with the real
administrator account. Google OAuth credentials are optional. The MySQL data
volume is named `mysql_data`; back it up independently before deployment or
upgrades.

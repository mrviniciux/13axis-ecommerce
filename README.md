# 13axis Ecommerce

A basic e-commerce storefront concept for learning and experimenting with modern
web development. The project uses a small, local sample catalog of T-shirts to
explore shopping journeys and, especially, Next.js concepts such as caching and
the differences between Server and Client Components.

<img width="1072" height="932" alt="Storefront screenshot" src="https://github.com/user-attachments/assets/a1923126-592a-4f89-94b9-f6bea49a8339" />

This is a learning project, not a production store. The storefront catalog and
cart counter remain demo data. The administrative area uses Prisma with
PostgreSQL in every environment. It stores accounts, products, inventory
balances, and an auditable stock movement ledger. Sales figures on its dashboard
are illustrative, not connected to orders or payments.

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
  performance. The catalog is loaded from PostgreSQL through Prisma, so it also
  demonstrates fetching data from a live backend.

## Admin Area

The admin area lives under `/restrict/admin` (login at `/restrict/admin/login`)
and does not use the localized storefront layout. It stores users, products,
inventory, and stock movements through Prisma with PostgreSQL. See
[PostgreSQL](#postgresql).

The admin has two workspaces. **Produtos e estoque** manages products and stock.
**Catálogos** maintains categories, brands, and variations. Categories, brands,
and variations are reusable records that products reference through selects in
the product form, so they are not free-text fields. Each catalog record can be
renamed, deactivated, and reactivated; deactivating removes it from new-product
selects while keeping existing products intact. The product-form selects are
searchable comboboxes: typing filters the options ignoring letter case and
accents, and when no record matches the typed name (for example, an existing
`Branco` does not match `Branco Off-White`), the combobox offers to register it
without leaving the form. The seed creates the initial categories (Calça,
Camiseta, Moletom, Jaqueta, Calçado), brands (Nike, Adidas, MCD), and variations
(Preto, Branco, Cinza, Azul, Marrom, Verde). Demo product photos are sourced
from Pexels and chosen to match each product's type and color.

Product variants have unique SKUs and optional barcodes, cost and sale prices,
attributes, and a linked inventory balance. Stock counts track physical units,
reservations, and reorder points separately; every manual adjustment requires a
reason and creates an auditable movement record. Integration channels and
external SKU/product mappings are modeled for future marketplace sync. No
external platform is connected yet.

The admin catalog supports product and primary-variant edits, image uploads
(JPEG, PNG, or WebP up to 2 MB), and inactivation/reactivation. Uploaded images
are stored in the database. Inactivation archives a product from the storefront
without deleting its inventory movement history. Sales figures on the dashboard
are illustrative and are not connected to orders or payments.

Google sign-in is optional; configure `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET` in `.env` and register
`http://localhost:3000/api/auth/callback/google` as the OAuth callback in Google
Cloud.

## Technology

- Next.js 15 with the App Router
- React 18 and TypeScript
- `next-intl` for localization
- Tailwind CSS 4
- Prisma ORM with PostgreSQL
- Jest and Testing Library
- Playwright for end-to-end tests
- Nx monorepo with pnpm workspaces

## Requirements

- Node.js `22.23.3` (see `.nvmrc`)
- pnpm `9.15.9`
- Docker and Docker Compose (optional)

Install pnpm and the project dependencies from the repository root:

```bash
npm install --global pnpm@9.15.9
pnpm install --frozen-lockfile
```

Alternatively, enable [Corepack](https://nodejs.org/api/corepack.html) and let
the `packageManager` field in `package.json` select pnpm automatically:

```bash
corepack enable
pnpm install --frozen-lockfile
```

## Local Development

This repository is an Nx monorepo that uses pnpm workspaces. Install the
dependencies once from the repository root (see [Requirements](#requirements)
for the pinned Node.js and pnpm versions):

```bash
pnpm install --frozen-lockfile
```

The storefront is the `storefront` Nx project under `apps/storefront`. Start it
with hot reload from the repository root:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Portuguese (Brazil) is the
default locale at `/br`; English (United States) is available at `/us`.

`pnpm dev` starts Next.js only. The product catalog and the admin area under
`/restrict/admin` query the database through Prisma, so configure PostgreSQL and
apply the migrations before using those pages. `AUTH_SECRET` is also required
for the admin area. See [PostgreSQL](#postgresql) below, or use the Docker
Compose environment, which starts the database and storefront together.

You can also run an Nx target directly:

```bash
pnpm nx show projects
pnpm nx run storefront:dev
```

Application targets are available as root shortcuts, including `pnpm build`,
`pnpm start`, `pnpm test`, `pnpm lint`, and `pnpm typecheck`. Add future
applications as separate projects under `apps/` (for example, an admin
application) and define their Nx targets in their own `project.json`.

To run a script inside the storefront package from the repository root, use the
`--filter` flag, for example
`pnpm --filter @13axis/storefront db:generate`.

## PostgreSQL

The application uses PostgreSQL in local development, Docker, and production.
The previous MySQL schema and migrations were removed; existing MySQL data is
not migrated automatically. Export and import it separately if needed.

### Configuration

Copy `.env.example` to `.env` and set the connection values. Docker Compose
reads the root `.env` file. Next.js reads `.env.local` from its own project
directory, so when running `pnpm dev` outside Docker, create
`apps/storefront/.env.local` with at least `DATABASE_URL` and `AUTH_SECRET`, or
export those variables in the shell before starting the app.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma and the app |
| `POSTGRES_DB` | Database name used by Docker Compose |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | Application database user and password |
| `POSTGRES_PORT` | Host port for the Compose database (default `5432`) |
| `AUTH_SECRET` | Auth.js session secret |
| `ADMIN_EMAIL` | Optional locally; the intended administrator in production |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth credentials |

Example:

```text
DATABASE_URL=postgresql://axis_admin:change-this-local-password@127.0.0.1:5432/axis_store
```

On Vercel's Prisma Postgres integration, the platform may inject
`POSTGRES_PRISMA_DATABASE_URL` and `POSTGRES_URL` instead of `DATABASE_URL`.
The app and the Prisma scripts accept those names as fallbacks, but setting
`DATABASE_URL` explicitly is recommended.

### Option A: PostgreSQL from Docker Compose (recommended)

Docker Compose provides PostgreSQL 17 with the credentials from `.env`. When
Next.js runs separately through `pnpm dev`, start only the database service:

```bash
docker compose up -d db
docker compose ps
```

If port `5432` is already in use, change `POSTGRES_PORT` in `.env` and in
`DATABASE_URL`.

Before starting `pnpm dev`, add the same `DATABASE_URL` and `AUTH_SECRET` to
`apps/storefront/.env.local`, or export them in the terminal. The root `.env`
file is not loaded by the Next.js app when it runs from its own directory.

Wait until the `db` service reports `healthy`. Then apply the versioned
migrations with the Compose `migrate` service, which already receives the
connection string:

```bash
docker compose run --build --rm migrate
```

Optionally, seed the sample catalog:

```bash
docker compose run --build --rm seed
```

Stop the database with `docker compose down`; add `-v` to also delete the
`postgres_data` volume and reset the data.

### Option B: PostgreSQL installed locally

Create the database and application user, then point `DATABASE_URL` at
`127.0.0.1:5432` (or the port your PostgreSQL server uses):

```sql
CREATE USER axis_admin WITH PASSWORD 'change-this-local-password';
CREATE DATABASE axis_store OWNER axis_admin;
```

Use the same database name, user, and password in `.env`, then load
`DATABASE_URL` into the shell before running Prisma:

```powershell
# Windows PowerShell
$env:DATABASE_URL = "postgresql://axis_admin:change-this-local-password@127.0.0.1:5432/axis_store"
```

```bash
# macOS/Linux
export DATABASE_URL="postgresql://axis_admin:change-this-local-password@127.0.0.1:5432/axis_store"
```

### Migrations

Migration files live in `apps/storefront/prisma/migrations`. `pnpm dev` does not
apply them automatically, so run the steps below before starting the storefront
with the catalog or admin area, and whenever you pull changes that add new
migrations.

With **Option A**, the Compose `migrate` service applies everything for you.
With **Option B**, export `DATABASE_URL` in the terminal as shown above and run
Prisma from the repository root.

Check which migrations have already been applied:

```bash
pnpm --filter @13axis/storefront db:status
```

Apply all pending migrations and regenerate the Prisma Client:

```bash
pnpm --filter @13axis/storefront db:generate
pnpm --filter @13axis/storefront db:migrate
```

`migrate deploy` only applies migrations that have not run yet; it never creates
or edits migration files and is safe to rerun. It is the command to use against
an existing database.

To synchronize a disposable local database without recording migration history,
use `db:push`. This is useful for quick schema prototyping, but it does not add
entries to `_prisma_migrations`; do not mix it with `db:migrate` on the same
database:

```bash
pnpm --filter @13axis/storefront db:push
```

#### Creating a migration after changing the schema

Edit `apps/storefront/prisma/schema.prisma`, then create and apply a migration:

```bash
pnpm --filter @13axis/storefront db:migrate:dev -- --name describe_change
```

This creates a new folder under `prisma/migrations`, applies it to the local
database, and regenerates the Prisma Client. Commit the generated migration
together with the schema change.

#### Resetting the local database

To drop the local schema and re-apply every migration from scratch:

```bash
pnpm --filter @13axis/storefront db:reset
```

`db:reset` deletes all local data. Never run it against production. Run
`pnpm --filter @13axis/storefront db:seed` afterwards if you want the sample
catalog back.

### Deploying to Vercel

Set `DATABASE_URL` in the Vercel project to the Prisma Postgres connection
string. Use the direct (non-pooled) URL for migrations. If the Prisma Postgres
integration already injected `POSTGRES_PRISMA_DATABASE_URL` or `POSTGRES_URL`,
the app and build scripts use it as a fallback, but an explicit `DATABASE_URL`
is easier to reason about.

O deploy da Vercel executa `pnpm vercel-build`. Esse script roda, nesta ordem:

1. `db:migrate` (`prisma migrate deploy`);
2. `db:seed` (seed idempotente do catálogo);
3. `pnpm build`.

A configuração está em `vercel.json` e nos scripts `db:deploy`/`vercel-build` da
raiz e de `apps/storefront`. Se o projeto tiver um Build Command customizado no
painel da Vercel, apague-o ou altere para `pnpm vercel-build`; caso contrário, o
comando do painel pode ignorar o script automático. O fluxo roda em qualquer
deployment que use o build padrão, incluindo Preview.

O seed não apaga dados e usa `upsert`/verificação de slug, mas ele mantém as
imagens do catálogo de demonstração sincronizadas com
`scripts/seed-products.ts`. Se não quiser seed em algum ambiente, remova o
`db:seed` do script `db:deploy` naquele ambiente.

Na primeira vez, a migration inicial é aplicada automaticamente. Se o banco de
produção já tiver as tabelas criadas fora do Prisma, sem histórico em
`_prisma_migrations`, faça o baseline uma vez antes do deploy automático:

```bash
pnpm --filter @13axis/storefront exec prisma migrate resolve --applied 20261020130000_init --schema prisma/schema.prisma
```

Execute esse comando com `DATABASE_URL` exportado. Depois disso, os próximos
deploys aplicam apenas migrations pendentes e executam o seed.

Para rodar o mesmo fluxo localmente:

```bash
pnpm db:deploy
```

Em desenvolvimento local, a primeira conta registrada em
`/restrict/admin/login` torna-se administradora; cadastros posteriores não
recebem acesso administrativo.

## Project Structure

```text
apps/
  storefront/
    src/
      app/[locale]/            Localized App Router pages and layouts
      components/              Shared UI and storefront components
      i18n/                    Locale routing and translation messages
      lib/                     Prisma queries, product mapping, and demo cart state
      styles/                  Global styles and theme tokens
    prisma/
      schema.prisma            PostgreSQL schema
      migrations/              Versioned PostgreSQL migrations
    scripts/                   Seed and Prisma helpers
    project.json               Nx targets for the storefront
    vercel.json                Build command for app-root deployments
vercel.json                    Vercel build: migrations, seed, and app build
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

The development Compose stack starts PostgreSQL, applies the versioned
migrations, seeds the catalog, and then starts the storefront. The production
stack starts PostgreSQL, applies migrations, and starts the app; it does not run
the seed automatically. In production, set `POSTGRES_PASSWORD`, `AUTH_SECRET`,
and `ADMIN_EMAIL` in `.env` before startup; only the `ADMIN_EMAIL` address can
claim the first account, including through Google. Google OAuth credentials are
optional. Use a unique `AUTH_SECRET` outside local development. The PostgreSQL
data volume is named `postgres_data`; back it up independently before deployment
or upgrades.

## Storybook

Start the Storybook development server:

```bash
pnpm storybook
```

Build the static Storybook:

```bash
pnpm build-storybook
```

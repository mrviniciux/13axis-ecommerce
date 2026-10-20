# 13axis Ecommerce

A basic e-commerce storefront concept for learning and experimenting with modern
web development. The project uses a small, local sample catalog of T-shirts to
explore shopping journeys and, especially, Next.js concepts such as caching and
the differences between Server and Client Components.

<img width="1072" height="932" alt="Storefront screenshot" src="https://github.com/user-attachments/assets/a1923126-592a-4f89-94b9-f6bea49a8339" />

This is a learning project, not a production store. The storefront catalog and
cart counter remain demo data. The administrative area uses Prisma with MySQL
locally and PostgreSQL (Netlify Database) when deployed to Netlify. It stores
accounts, products, inventory balances, and an auditable stock movement ledger.
Sales figures on its dashboard are illustrative, not connected to orders or
payments.

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

## Admin Area

The admin area lives under `/restrict/admin` (login at `/restrict/admin/login`)
and does not use the localized storefront layout. It stores users, products,
inventory, and stock movements through Prisma in MySQL locally or PostgreSQL on
Netlify. See [Local MySQL](#local-mysql) and
[Netlify deploy](NETLIFY_DEPLOY.md).

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
are stored in the database, so the same admin behavior works on MySQL and
PostgreSQL. Inactivation archives a product from the storefront without deleting
its inventory movement history. Sales figures on the dashboard are illustrative
and are not connected to orders or payments.

Google sign-in is optional; configure `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET` in `.env` and register
`http://localhost:3000/api/auth/callback/google` as the OAuth callback in Google
Cloud.

## Technology

- Next.js 15 with the App Router
- React 18 and TypeScript
- `next-intl` for localization
- Tailwind CSS 4
- Prisma ORM with MySQL (local) and PostgreSQL (Netlify Database)
- Jest and Testing Library
- Playwright for end-to-end tests
- Nx monorepo with pnpm workspaces

## Requirements

- Node.js `22.23.3` (see `.nvmrc`; `@netlify/database` requires 22.12+)
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
`/restrict/admin` query the database through Prisma, so configure MySQL and
apply the migrations before using those pages. `AUTH_SECRET` is also required
for the admin area. See [Local MySQL](#local-mysql) below, or use the Docker
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

## Database providers

The application uses the same Prisma models and seed for two providers:

| Environment       | Provider   | Prisma schema                | Migrations                                      |
| ----------------- | ---------- | ---------------------------- | ----------------------------------------------- |
| Local / Docker    | MySQL      | `prisma/mysql/schema.prisma` | `prisma/mysql/migrations`                       |
| Netlify           | PostgreSQL | `prisma/schema.prisma`       | `netlify/database/migrations` (applied by Netlify) |

`DATABASE_PROVIDER` selects the provider. It defaults to `mysql` locally and is
set to `postgresql` in `netlify.toml`. The Prisma Client is generated for one
provider at a time, so run `db:generate` after changing the environment:

```bash
pnpm --filter @13axis/storefront db:generate           # uses DATABASE_PROVIDER
pnpm --filter @13axis/storefront db:generate:mysql     # force MySQL
pnpm --filter @13axis/storefront db:generate:postgres  # force PostgreSQL
```

The seed works with both providers:

```bash
pnpm --filter @13axis/storefront db:seed
```

For PostgreSQL, set `DATABASE_PROVIDER=postgresql` and `NETLIFY_DB_URL` before
running the seed. Netlify applies the PostgreSQL migrations automatically; see
[NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md).

## Local MySQL

Local development uses MySQL through Prisma. Configure a database once before
running the product catalog or admin routes.

### Configuration file

Copy the example environment file and change the local passwords:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead. The relevant
variables are:

| Variable                                    | Purpose                                                                             |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| `MYSQL_DATABASE`                            | Database name (default `axis_store`)                                                |
| `MYSQL_USER` / `MYSQL_PASSWORD`             | Application database user and password                                              |
| `MYSQL_ROOT_PASSWORD`                       | Root password, used by the Compose healthcheck                                      |
| `MYSQL_PORT`                                | Host port used in `DATABASE_URL` and the production Compose mapping (default `3306`) |
| `DATABASE_URL`                              | Prisma connection string; must match the values above                               |
| `AUTH_SECRET`                               | Auth.js session secret (generate with `openssl rand -base64 32`)                    |
| `ADMIN_EMAIL`                               | Optional locally; the intended administrator in production                          |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth credentials                                                   |

`DATABASE_URL` must point at the same database the `MYSQL_*` variables create,
for example:

```text
mysql://axis_admin:change-this-local-password@127.0.0.1:3306/axis_store
```

`pnpm dev` and the other Nx tasks load this root `.env` automatically. The Prisma
CLI does not, so the commands below either run through Docker Compose or export
`DATABASE_URL` explicitly.

### Option A: MySQL from Docker Compose (recommended)

Docker Compose provides a MySQL 8.4 server with the credentials from `.env`. When
Next.js runs separately through `pnpm dev`, start only the database service:

```bash
docker compose up -d db
docker compose ps
```

If port `3306` is already in use (for example, by a native MySQL service), stop
that service or change the host port mapping in `docker-compose.yml` and the port
in `DATABASE_URL`.

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
`mysql_data` volume and reset the data.

### Option B: MySQL installed locally

If MySQL 8 runs natively, create the database and application user, then point
`DATABASE_URL` at `127.0.0.1:3306` (or the port your MySQL server uses):

```sql
CREATE DATABASE axis_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'axis_admin'@'localhost' IDENTIFIED BY 'change-this-local-password';
GRANT ALL PRIVILEGES ON axis_store.* TO 'axis_admin'@'localhost';
FLUSH PRIVILEGES;
```

Use the same database name, user, and password in `.env`, then load
`DATABASE_URL` into the shell before running Prisma:

```powershell
# Windows PowerShell
$env:DATABASE_URL = "mysql://axis_admin:change-this-local-password@127.0.0.1:3306/axis_store"
```

```bash
# macOS/Linux
export DATABASE_URL="mysql://axis_admin:change-this-local-password@127.0.0.1:3306/axis_store"
```

### Migrations

Migration files live in `apps/storefront/prisma/mysql/migrations`. `pnpm dev`
does not apply them automatically, so run the steps below before starting the
storefront with the catalog or admin area, and whenever you pull changes that
add new migrations.

With **Option A**, the Compose `migrate` service applies everything for you:

```bash
docker compose run --build --rm migrate
```

With **Option B**, export `DATABASE_URL` in the terminal as shown above and run
Prisma from the repository root.

Check which migrations have already been applied:

```bash
pnpm --filter @13axis/storefront exec prisma migrate status --schema prisma/mysql/schema.prisma
```

Apply all pending migrations and regenerate the Prisma Client:

```bash
pnpm --filter @13axis/storefront db:generate
pnpm --filter @13axis/storefront db:migrate
```

`migrate deploy` only applies migrations that have not run yet; it never creates
or edits migration files and is safe to rerun. It is the command to use against
an existing local database.

#### Creating a migration after changing the schema

Edit `apps/storefront/prisma/mysql/schema.prisma`, then create and apply a
migration:

```bash
pnpm --filter @13axis/storefront exec prisma migrate dev --schema prisma/mysql/schema.prisma --name describe_change
```

This creates a new folder under `prisma/mysql/migrations`, applies it to the
local database, and regenerates the Prisma Client. Commit the generated
migration together with the schema change.

`migrate dev` requires a temporary shadow database, so the MySQL user must be
able to create and drop databases. For a native local MySQL, grant the
development user the extra privileges (local development only):

```sql
GRANT ALL PRIVILEGES ON *.* TO 'axis_admin'@'localhost';
FLUSH PRIVILEGES;
```

For the Compose database, use the root credentials from `.env` in `DATABASE_URL`
when running this command. Alternatively, use the MySQL root account for any
local installation.

#### Resetting the local database

To drop the local schema and re-apply every migration from scratch:

```bash
pnpm --filter @13axis/storefront exec prisma migrate reset --schema prisma/mysql/schema.prisma
```

`migrate reset` deletes all local data. Never run it against production.

In local development, the first account registered at
`/restrict/admin/login` becomes the administrator; later registrations do not
receive administrative access.

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
      schema.prisma            PostgreSQL schema (Netlify)
      mysql/                   MySQL schema and migrations (local)
    netlify/database/migrations/  PostgreSQL migrations applied by Netlify
    scripts/                   Seed and Prisma generation helpers
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

Compose starts MySQL, applies the versioned migrations, seeds the catalog, and
then starts the storefront. In production, set `MYSQL_PASSWORD`,
`MYSQL_ROOT_PASSWORD`, `AUTH_SECRET`, and `ADMIN_EMAIL` in `.env` before startup;
only the `ADMIN_EMAIL` address can claim the first account, including through
Google. Google OAuth credentials are optional. Use a unique `AUTH_SECRET` outside
local development. The MySQL data volume is named `mysql_data`; back it up
independently before deployment or upgrades.

## Storybook

Start the Storybook development server:

```bash
pnpm storybook
```

Build the static Storybook:

```bash
pnpm build-storybook
```

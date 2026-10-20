# Deploy no Netlify

Este guia explica como fazer o deploy da aplicação 13axis Ecommerce no Netlify
usando **Netlify Database (PostgreSQL)**. O desenvolvimento local continua
usando **MySQL**; o código seleciona o provider pelo ambiente.

## Como funciona

| Ambiente          | Banco                | Schema Prisma              | Client gerado         |
| ----------------- | -------------------- | -------------------------- | --------------------- |
| Local / Docker    | MySQL                | `prisma/mysql/schema.prisma` | MySQL               |
| Netlify           | PostgreSQL (Netlify) | `prisma/schema.prisma`       | PostgreSQL + `pg`   |

O script `apps/storefront/scripts/prisma-generate.mjs` escolhe o schema:

- `DATABASE_PROVIDER=mysql` (padrão local) gera o client MySQL.
- `DATABASE_PROVIDER=postgresql` (definido em `netlify.toml`) gera o client
  PostgreSQL usado com o adapter `@prisma/adapter-pg`.

As migrations do PostgreSQL ficam em
`apps/storefront/netlify/database/migrations/` e são aplicadas automaticamente
pelo Netlify Database durante o deploy. Não execute `prisma migrate deploy`
contra o banco gerenciado do Netlify.

## Pré-requisitos

1. Conta no [Netlify](https://netlify.com).
2. Repositório conectado ao Netlify.
3. Netlify Database habilitado no site (o pacote `@netlify/database` já está
   nas dependências e faz o Netlify provisionar o PostgreSQL).

## Configuração no Netlify

### 1. Conectar o repositório

No painel do Netlify, clique em **Add new site > Import an existing project** e
selecione este repositório.

### 2. Configurações de build

O `netlify.toml` já define:

| Configuração      | Valor              |
| ----------------- | ------------------ |
| Base directory    | `apps/storefront`  |
| Build command     | `pnpm build`       |
| Publish directory | `.next`            |

O comando `pnpm build` do pacote executa o target Nx `storefront:build`, que
gera o client Prisma antes do `next build`.

### 3. Variáveis de ambiente

| Variável              | Valor                                      | Obrigatório |
| --------------------- | ------------------------------------------ | ----------- |
| `DATABASE_PROVIDER`   | `postgresql` (já definido no `netlify.toml`) | Sim       |
| `NETLIFY_DB_URL`      | fornecida automaticamente pelo Netlify DB  | Sim         |
| `AUTH_SECRET`         | `openssl rand -base64 32`                  | Sim         |
| `NEXTAUTH_URL`        | `https://seu-site.netlify.app`             | Sim         |
| `ADMIN_EMAIL`         | e-mail do administrador                    | Recomendado |
| `GOOGLE_CLIENT_ID`    | opcional                                   | Não         |
| `GOOGLE_CLIENT_SECRET`| opcional                                   | Não         |

Não configure `DATABASE_URL` de MySQL no Netlify. O runtime usa
`NETLIFY_DB_URL` e o adapter PostgreSQL.

### 4. Migrations

Os arquivos SQL em `apps/storefront/netlify/database/migrations/` são aplicados
pelo Netlify Database no deploy. Para alterar o schema PostgreSQL:

1. Atualize `apps/storefront/prisma/schema.prisma`.
2. Crie uma nova migration SQL em
   `apps/storefront/netlify/database/migrations/<timestamp>_<nome>/migration.sql`.
3. Faça commit e deploy.

Não edite uma migration que já foi aplicada; crie uma nova.

> Se você já havia feito deploy da versão antiga desta branch, que continha
> duas migrations iniciais duplicadas, recrie o banco do Netlify (ou o branch
> de preview). A migration duplicada tentava criar as mesmas tabelas duas vezes.

### 5. Seed no PostgreSQL

O mesmo seed usado no MySQL funciona no PostgreSQL. Depois que o primeiro
deploy aplicar as migrations, pegue a `NETLIFY_DB_URL` em
**Site configuration > Environment variables** e execute localmente:

```bash
cd apps/storefront
export DATABASE_PROVIDER=postgresql
export NETLIFY_DB_URL="postgresql://..."
pnpm db:seed
```

No PowerShell:

```powershell
cd apps/storefront
$env:DATABASE_PROVIDER = "postgresql"
$env:NETLIFY_DB_URL = "postgresql://..."
pnpm db:seed
```

O comando gera o client PostgreSQL antes de executar o seed. O seed é
idempotente: catálogos usam `upsert`, produtos existentes são ignorados (com
atualização das imagens de demonstração) e produtos novos são criados.

## Desenvolvimento local (MySQL)

Nada muda no fluxo local:

```bash
# na raiz
docker compose up -d db
docker compose run --build --rm migrate
docker compose run --build --rm seed
pnpm dev
```

Ou, com MySQL já configurado e `DATABASE_URL` exportado no shell (veja o
[README](README.md#local-mysql)):

```bash
export DATABASE_URL="mysql://axis_admin:change-this-local-password@127.0.0.1:3306/axis_store"
cd apps/storefront
pnpm db:generate   # gera o client MySQL (DATABASE_PROVIDER=mysql por padrão)
pnpm db:migrate    # aplica as migrations MySQL
pnpm db:seed       # popula catálogos e produtos
```

No PowerShell, use `$env:DATABASE_URL = "mysql://..."` antes dos comandos.

Consulte o [README](README.md#local-mysql) para os detalhes do MySQL local.

## Comandos úteis

```bash
# Build local
pnpm build

# Gerar o client do provider atual
pnpm --filter @13axis/storefront db:generate

# Forçar um provider específico
pnpm --filter @13axis/storefront db:generate:mysql
pnpm --filter @13axis/storefront db:generate:postgres

# Aplicar migrations MySQL
pnpm --filter @13axis/storefront db:migrate

# Seed (gera o client do provider atual antes)
pnpm --filter @13axis/storefront db:seed
```

## Limitações

- O Netlify não fornece MySQL gerenciado; por isso o deploy usa Netlify
  Database (PostgreSQL). Um MySQL externo também pode ser usado, mas exige
  ajustar o runtime para o provider MySQL e não é o caminho padrão.
- O Netlify é serverless: não aponte `DATABASE_URL` para `localhost`.
- O carrinho continua sendo estado local do cliente e não depende do banco.

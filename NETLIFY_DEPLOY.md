# Deploy no Netlify

Este guia explica como fazer o deploy da aplicação 13axis Ecommerce no Netlify.

## Pré-requisitos

1. Conta no [Netlify](https://netlify.com)
2. Banco de dados MySQL externo (o Netlify não fornece MySQL nativo)
   - Recomendado: [PlanetScale](https://planetscale.com), [Aiven](https://aiven.io), ou qualquer MySQL hospedado
3. O repositório conectado ao Netlify

## Configuração no Netlify

### 1. Conectar o repositório

No painel do Netlify, clique em "Add new site" > "Import an existing project" e selecione este repositório.

### 2. Configurações de build

No painel do Netlify, vá em **Site settings > Build & deploy** e configure:

| Configuração | Valor |
|-------------|-------|
| Base directory | `apps/storefront` |
| Build command | `pnpm build` |
| Publish directory | `.next` |

### 3. Variáveis de ambiente

Vá em **Site settings > Environment variables** e adicione as seguintes variáveis:

| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `DATABASE_URL` | `mysql://usuario:senha@host:porta/banco` | ✅ Sim |
| `AUTH_SECRET` | `openssl rand -base64 32` | ✅ Sim |
| `NEXTAUTH_URL` | `https://seu-site.netlify.app` | ✅ Sim |
| `ADMIN_EMAIL` | `seu-email@exemplo.com` | ⚠️ Recomendado |
| `GOOGLE_CLIENT_ID` | (opcional) | ❌ Não |
| `GOOGLE_CLIENT_SECRET` | (opcional) | ❌ Não |

> **Nota:** A área administrativa (`/restrict/admin`) requer um banco MySQL externo. Sem `DATABASE_URL`, apenas a storefront pública funcionará, mas sem produtos vindos do banco.

### 4. Banco de dados

Após o deploy, execute as migrações do Prisma no banco de dados externo:

```bash
# Localmente, com o DATABASE_URL do Netlify configurado no .env
pnpm prisma generate
pnpm prisma db push
```

Ou use o Prisma Migrate para criar as tabelas:
```bash
pnpm prisma migrate deploy
```

### 5. Seed de produtos (opcional)

Para cadastrar produtos fictícios no banco:

```bash
pnpm ts-node scripts/seed-products.ts
```

## Estrutura de arquivos criada/modificada

- `netlify.toml` — Configuração de build e redirects para o Netlify
- `apps/storefront/next.config.mjs` — Ajustado para compatibilidade com o Netlify (output undefined)
- `NETLIFY_DEPLOY.md` — Este arquivo

## Limitações

- O Netlify é serverless, então não é possível rodar MySQL localmente nele. Use um banco MySQL externo.
- A área administrativa requer autenticação e banco de dados. Configure `DATABASE_URL` e `ADMIN_EMAIL` para habilitá-la.
- O carrinho de compras usa Zustand (estado local do cliente) e funciona normalmente sem banco.

## Comandos úteis

```bash
# Build local para testar
pnpm build

# Iniciar localmente
pnpm start

# Gerar cliente Prisma
pnpm prisma generate

# Aplicar migrações
pnpm prisma migrate deploy
```

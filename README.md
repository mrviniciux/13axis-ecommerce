# React 18 Next.js Template

Template de aplicação com React 18, Next.js 15, TypeScript, internacionalização com `next-intl`, Jest, Playwright, Storybook e Docker.

## Requisitos

- Node.js `20.17.0` (consulte `.nvmrc`)
- pnpm `9.15.9`
- Docker e Docker Compose (opcional)

Instale a versão definida pelo projeto e as dependências:

```bash
npm install --global pnpm@9.15.9
pnpm install --frozen-lockfile
```

## Desenvolvimento local

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000). O idioma padrão é português (`/br`); a versão em inglês está em `/us`.

## Testes e verificações

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm test:e2e
```

O Playwright usa Chromium. Instale o navegador antes da primeira execução:

```bash
pnpm exec playwright install chromium
```

## Build e execução de produção

```bash
pnpm build
pnpm start
```

O build gera a saída otimizada do Next.js; a imagem Docker de produção usa a saída standalone. No Windows, o build local usa a saída padrão do Next.js para evitar a necessidade de permissões especiais para links simbólicos.

## Docker

Para desenvolvimento com hot reload:

```bash
docker compose up --build
```

Para build e execução do container de produção:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Nos dois casos, a aplicação fica disponível em [http://localhost:3000](http://localhost:3000). Para parar o ambiente de produção, use `docker compose -f docker-compose.prod.yml down`.

## Storybook

```bash
pnpm storybook
```

Para gerar a versão estática:

```bash
pnpm build-storybook
```

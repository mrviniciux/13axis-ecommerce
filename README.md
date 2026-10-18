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

## Estilos com Tailwind CSS

Tailwind CSS está disponível nos componentes e páginas da aplicação por meio das classes utilitárias:

```tsx
<div className="flex items-center gap-4 p-4">Conteúdo</div>
```

## Tema e identidade visual

A identidade visual padrão é uma paleta neutra em escala de cinza (preto, branco e tons de cinza), definida por variáveis CSS em `src/styles/globals.css` e exposta ao Tailwind via `@theme inline`. Todas as cores usam `oklch` com crominância zero (chroma = 0), o que mantém um cinza harmonioso e consistente entre os modos claro e escuro.

### Tokens principais

| Token                             | Modo claro                | Modo escuro                | Uso                                 |
| --------------------------------- | ------------------------- | -------------------------- | ----------------------------------- |
| `--background`                    | branco                    | preto                      | Fundo da página                     |
| `--foreground`                    | preto                     | branco                     | Texto base                          |
| `--primary`                       | quase preto               | quase branco               | Ações primárias                     |
| `--muted` / `--muted-foreground`  | cinza claro / cinza médio | cinza escuro / cinza claro | Áreas de repouso e texto secundário |
| `--border` / `--input` / `--ring` | cinza claro               | branco 10–15%              | Bordas, campos e foco               |

Para trocar a paleta, edite os valores em `:root` (modo claro) e `.dark` (modo escuro) em `src/styles/globals.css`. Mantenha a crominância em `0` para preservar a estética em escala de cinza, ou aumente o valor do chroma para introduzir cores de marca.

### Hero

O carrossel do hero (`src/components/HeroCarousel`) usa os tokens de tema (`bg-muted`, `bg-background`, `text-foreground`) e os slides em `public/hero-slide-*.svg` seguem a mesma paleta neutra. O autoplay avança a cada 5 segundos (`autoplayDelay`, com `stopOnInteraction: false`) e o layout é de um slide único em tela cheia, responsivo para mobile e resoluções maiores (altura entre `420px` e `600px`, baseada em `60svh`).

## Criar componentes

Gere um componente em `src/components` com arquivo de implementação, teste e exportação:

```bash
pnpm create:component NomeDoComponente
```

O nome deve estar em PascalCase e conter apenas letras e números. O comando não sobrescreve uma pasta de componente existente.

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

# Contexto do projeto

## Produto

Este repositório é a base de uma loja virtual (e-commerce). O produto deve evoluir para apoiar a jornada de compra: descoberta e busca de produtos, navegação por catálogo, carrinho, checkout, pedidos, entrega e conta do cliente.

Importante: trate esses itens como contexto de domínio, não como funcionalidades já implementadas. Atualmente a aplicação é principalmente uma base de storefront; confirme o código existente antes de assumir que há catálogo, API, persistência, autenticação, pagamento ou gestão de pedidos. Por exemplo, o contador atual do carrinho na navbar é estado local de demonstração.

## Arquitetura atual

- Next.js 15 com App Router, React 18 e TypeScript.
- Rotas da aplicação ficam em `src/app/[locale]`.
- `next-intl` fornece localização: português (`pt-BR`, prefixo `/br`) e inglês (`en-US`, prefixo `/us`). Mensagens ficam em `src/i18n/messages`.
- Componentes compartilhados ficam em `src/components`; componentes de interface reutilizáveis ficam em `src/components/ui`.
- Tailwind CSS 4 é usado para estilos utilitários. Tokens e estilos globais ficam em `src/styles/globals.css`; preserve as variáveis CSS existentes ao alterar o tema.
- A fonte global Montserrat é configurada pelo `next/font` no layout localizado.
- Os componentes devem manter comportamento responsivo, acessibilidade por teclado e rótulos acessíveis para controles interativos.

## Convenções de implementação

- Antes de adicionar uma funcionalidade de e-commerce, verifique se existem modelos, serviços ou integrações relacionados. Não invente endpoints, dados de produtos, regras comerciais ou comportamento de pagamento.
- Mantenha textos da interface localizáveis e siga os idiomas já configurados.
- Reutilize os componentes existentes em `src/components/ui` e os padrões locais de composição antes de introduzir dependências ou abstrações.
- Componentes em `src/components/<Nome>/` seguem o padrão `<Nome>.tsx`, `<Nome>.spec.tsx` e `index.ts`. O gerador está disponível por `pnpm create:component NomeDoComponente`.
- Preserve alterações locais preexistentes no workspace ao trabalhar em arquivos modificados.

## Verificação

- `pnpm lint`: ESLint.
- `pnpm test`: Jest e Testing Library.
- `pnpm test:e2e`: Playwright.
- `pnpm typecheck`: verificação TypeScript.
- `pnpm build`: build de produção.

Use verificações focadas nos arquivos alterados quando possível. Ao encontrar falhas em código não relacionado, reporte-as sem ampliar o escopo da mudança.

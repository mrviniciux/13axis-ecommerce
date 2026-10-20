# Administração 13axis: implementação e pendências

## Estado atual

A área administrativa foi adicionada ao projeto `apps/storefront` e usa as rotas sem locale `/restrict/admin`, `/restrict/admin/login` e `/restrict/admin/products`. A administração não exibe a navbar da storefront; a loja continua localizada em `/br` e `/us`.

## O que foi implementado

- Layout raiz compartilhado com fonte Montserrat, tema e CSS globais; layout da storefront continua responsável por `next-intl` e navbar.
- Login Auth.js com e-mail e senha. Senhas são validadas com Zod e armazenadas com hash bcrypt.
- A primeira conta cadastrada recebe a role `ADMIN`. Cadastros posteriores ficam bloqueados na API e não recebem acesso administrativo.
- Login e cadastro com Google estão implementados condicionalmente. O botão aparece quando `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão definidos. A callback OAuth esperada é `http://localhost:3000/api/auth/callback/google`.
- Sessões JWT, callback de autorização e proteção server-side das páginas e endpoints; roles previstas: `ADMIN`, `INVENTORY_MANAGER` e `USER`.
- Dashboard com vendas fictícias claramente identificadas e KPIs de catálogo/estoque consultados do PostgreSQL.
- Cadastro de produto com categoria, marca, status, variante, SKU, código de barras opcional, atributos, custo, preço de venda, saldo inicial e ponto de reposição.
- Catálogos de categorias, marcas e variações em `/restrict/admin/catalogs`, com criação, renomeação, inativação e reativação; o cadastro de produtos usa comboboxes pesquisáveis vinculados a esses registros, com filtro que ignora maiúsculas/minúsculas e acentos e cadastro rápido quando o nome digitado não existe.
- Seed idempotente cria categorias (Calça, Camiseta, Moletom, Jaqueta, Calçado), marcas (Nike, Adidas, MCD) e variações (Preto, Branco, Cinza, Azul, Marrom, Verde) e um catálogo de exemplo.
- Estoque por variante com saldo físico, reservas e disponibilidade calculada; ajustes pedem quantidade e motivo, registram autor e movimentação, e recusam saldo abaixo das reservas. A gravação usa transação e proteção contra atualização concorrente.
- Schema relacional Prisma/PostgreSQL para usuário, OAuth, produto, variante, inventário, movimentação, canais de integração e mapeamentos externos de SKU/produto.
- PostgreSQL 17 com volume persistente, healthcheck e serviço de migração Prisma nos Compose de desenvolvimento e produção.
- Primeiro cadastro de produção limitado por `ADMIN_EMAIL`, obrigatório no Compose de produção e opcional no ambiente local; o README explica como deixar o onboarding aberto apenas em desenvolvimento.
- Variáveis e instruções de execução/OAuth em `.env.example`; guia atualizado em `README.md`.

## Verificações concluídas

- Docker local acessível; container PostgreSQL 17 ficou `healthy`.
- Conexão Prisma pelo host `127.0.0.1:5432` confirmada com o usuário de aplicação `axis_admin`.
- Migração inicial `20261020130000_init` gerada a partir do schema e aplicada; `db:status` informou que o schema está atualizado.
- `pnpm db:seed` criou 5 categorias, 3 marcas, 6 variações e 14 produtos no PostgreSQL local.
- `pnpm typecheck`, Jest (46 testes em 12 suítes), `pnpm lint` (0 erros e 2 avisos) e `pnpm build` passaram.
- `docker compose config --quiet` passou para o Compose de desenvolvimento; o Compose de produção também validou com as variáveis obrigatórias fornecidas temporariamente.
- O deploy da Vercel usa `vercel-build` para executar `db:migrate`, `db:seed` e `pnpm build`, conforme `vercel.json`.

## Pendências abertas

- Google OAuth: configurar `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` e validar a callback com uma conta autorizada. Bloqueado pela ausência dessas credenciais no ambiente.
- Vendas reais: conectar os KPIs a pedidos quando o domínio de pedidos/pagamentos existir. Até lá, o gráfico e os números comerciais são demonstrativos.
- Sincronização externa: implementar conectores quando marketplaces, regras de precedência de estoque e comportamento de conflitos forem definidos. O schema já prevê canais e mapeamentos; nenhuma plataforma está conectada.

As verificações locais com PostgreSQL e o teste automatizado estão concluídos. Atualize este documento caso credenciais, pedidos reais ou plataformas externas sejam adicionados; não marque as pendências externas como concluídas sem validação real.

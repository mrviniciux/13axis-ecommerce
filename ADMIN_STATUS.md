# Administração 13axis: implementação e pendências

## Estado atual

A área administrativa foi adicionada ao projeto `apps/storefront` e usa as rotas sem locale `/restrict/admin`, `/restrict/admin/login` e `/restrict/admin/products`. A administração não exibe a navbar da storefront; a loja continua localizada em `/br` e `/us`.

## O que foi implementado

- Layout raiz compartilhado com fonte Montserrat, tema e CSS globais; layout da storefront continua responsável por `next-intl` e navbar.
- Login Auth.js com e-mail e senha. Senhas são validadas com Zod e armazenadas com hash bcrypt.
- A primeira conta cadastrada recebe a role `ADMIN`. Cadastros posteriores ficam bloqueados na API e não recebem acesso administrativo.
- Login e cadastro com Google estão implementados condicionalmente. O botão aparece quando `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão definidos. A callback OAuth esperada é `http://localhost:3000/api/auth/callback/google`.
- Sessões JWT, callback de autorização e proteção server-side das páginas e endpoints; roles previstas: `ADMIN`, `INVENTORY_MANAGER` e `USER`.
- Dashboard com vendas fictícias claramente identificadas e KPIs de catálogo/estoque consultados do MySQL.
- Cadastro de produto com categoria, marca, status, variante, SKU, código de barras opcional, atributos, custo, preço de venda, saldo inicial e ponto de reposição.
- Estoque por variante com saldo físico, reservas e disponibilidade calculada; ajustes pedem quantidade e motivo, registram autor e movimentação, e recusam saldo abaixo das reservas. A gravação usa transação e proteção contra atualização concorrente.
- Schema relacional Prisma/MySQL para usuário, OAuth, produto, variante, inventário, movimentação, canais de integração e mapeamentos externos de SKU/produto.
- MySQL 8.4 com volume persistente, healthcheck e serviço de migração Prisma nos Compose de desenvolvimento e produção.
- Primeiro cadastro de produção limitado por `ADMIN_EMAIL`, obrigatório no Compose de produção e opcional no ambiente local; o README explica como deixar o onboarding aberto apenas em desenvolvimento.
- Variáveis e instruções de execução/OAuth em `.env.example`; guia atualizado em `README.md`.

## Verificações já concluídas

- Docker local acessível; container MySQL 8.4 ficou `healthy`.
- Conexão Prisma pelo host `127.0.0.1:3306` confirmada com o usuário de aplicação `axis_admin`; estado da migração lido com sucesso.
- Migração inicial `20261019125526_init` gerada e aplicada.
- Compose de desenvolvimento e de produção validaram configuração.
- Fluxo manual via navegador: cadastro do primeiro admin, login, rota administrativa protegida, cadastro de produto e ajuste de estoque de 12 para 14 unidades.
- Usuário e produto temporários de teste foram removidos do MySQL.
- `pnpm typecheck`, `pnpm test` (30 testes em 9 suítes), `pnpm lint` e `pnpm build` passaram. O lint/build ainda reportam dois avisos de `no-unused-vars` nas interfaces de augmentação do NextAuth.
- O container `migrate` via Compose terminou com código 0 e informou `No pending migrations to apply`.
- A primeira tentativa de abrir login no container web falhou porque o volume anônimo de `node_modules` ocultou o Prisma Client da imagem. O comando de desenvolvimento agora gera o client no volume antes de iniciar Next; depois disso, `/restrict/admin/login` respondeu HTTP 200 e o cadastro/autenticação do admin via Compose abriu o dashboard.
- Teste unitário do modal de ajuste passou, conferindo quantidade, motivo, atualização do saldo e fechamento do diálogo.
- Smoke test final sem sessão respondeu HTTP 200, mostrou o cadastro inicial e ocultou Google OAuth sem credenciais configuradas.
- A conta criada pelo smoke test no Compose foi removida; MySQL terminou com 0 usuários, 0 produtos e 0 movimentações de teste.
- Compose local e de produção passaram `config --quiet`; o serviço web e o banco permanecem ativos em `http://localhost:3000`.

## Pendências abertas

- Google OAuth: configurar `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` e validar a callback com uma conta autorizada. Bloqueado pela ausência dessas credenciais no ambiente.
- Vendas reais: conectar os KPIs a pedidos quando o domínio de pedidos/pagamentos existir. Até lá, o gráfico e os números comerciais são demonstrativos.
- Sincronização externa: implementar conectores quando marketplaces, regras de precedência de estoque e comportamento de conflitos forem definidos. O schema já prevê canais e mapeamentos; nenhuma plataforma está conectada.

As verificações locais/Docker e o teste automatizado estão concluídos. Atualize este documento caso credenciais, pedidos reais ou plataformas externas sejam adicionados; não marque as pendências externas como concluídas sem validação real.

FROM node:20.17.0-alpine AS base

WORKDIR /app

RUN npm install --global pnpm@9.15.9

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/storefront/package.json ./apps/storefront/package.json
COPY apps/storefront/prisma ./apps/storefront/prisma
RUN pnpm install --frozen-lockfile --registry https://registry.npmjs.org
RUN pnpm --filter @13axis/storefront exec prisma generate --schema prisma/schema.prisma
RUN pnpm --filter @13axis/storefront exec prisma generate --schema prisma/schema.prisma

FROM base AS builder

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=mysql://axis_admin:axis_local_password@db:3306/axis_store

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @13axis/storefront exec prisma generate --schema prisma/schema.prisma
RUN pnpm build

FROM base AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder /app/apps/storefront/public ./apps/storefront/public
COPY --from=builder --chown=node:node /app/apps/storefront/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/storefront/.next/static ./apps/storefront/.next/static

USER node
EXPOSE 3000

CMD ["node", "apps/storefront/server.js"]

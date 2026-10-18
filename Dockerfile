FROM node:20.17.0-alpine AS base

WORKDIR /app

RUN npm install --global pnpm@9.15.9

FROM base AS deps

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --registry https://registry.npmjs.org

FROM base AS builder

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

CMD ["node", "server.js"]

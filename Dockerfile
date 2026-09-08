# syntax=docker/dockerfile:1
FROM oven/bun:1.4.2 AS bun
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
ENV HUSKY=0
COPY package.json bun.lock prisma.config.ts ./
COPY patches ./patches
COPY prisma ./prisma
RUN bun install --frozen-lockfile

# Apply the committed migrations independently of the web server.
FROM dependencies AS migrate
RUN mkdir -p /data && chown node:node /data
USER node
CMD ["bun", "run", "prisma:migrate"]

FROM dependencies AS builder
COPY . .
ARG NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
ENV NEXT_PUBLIC_ROOT_DOMAIN=$NEXT_PUBLIC_ROOT_DOMAIN
# No real credentials or local databases are sent to the build.
RUN LOCAL_DATABASE_URL=file:/tmp/build.db bun run prisma:migrate \
    && SKIP_ENV_VALIDATION=1 \
    TURSO_DATABASE_URL=file:/tmp/build.db \
    TURSO_AUTH_TOKEN=local \
    BETTER_AUTH_SECRET="$(openssl rand -hex 32)" \
    BETTER_AUTH_URL=http://localhost:3000 \
    RESEND_API_KEY=re_not_configured \
    bun run build

FROM base AS runner
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
RUN mkdir -p /data /app/.next && chown -R node:node /data /app
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]

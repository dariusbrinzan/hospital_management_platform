FROM node:20-bookworm-slim AS deps

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ pkg-config ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ pkg-config ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

ARG NEXT_PUBLIC_APP_URL=https://carepulse.example.com
ARG NEXT_PUBLIC_ADMIN_PASSKEY=111111
ARG SENTRY_AUTH_TOKEN=
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_ADMIN_PASSKEY=${NEXT_PUBLIC_ADMIN_PASSKEY}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM deps AS prod-deps

RUN npm prune --omit=dev

FROM node:20-bookworm-slim AS runner

RUN apt-get update \
  && apt-get install -y --no-install-recommends tini ca-certificates postgresql-client \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid 1001 --create-home nextjs \
  && mkdir -p /app/data /opt/carepulse/bin \
  && chown -R nextjs:nodejs /app

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DISCOVERED_DB_ENV_FILE=/tmp/carepulse-discovered-db.env

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/sentry.client.config.ts ./sentry.client.config.ts
COPY --from=builder /app/sentry.edge.config.ts ./sentry.edge.config.ts
COPY --from=builder /app/sentry.server.config.ts ./sentry.server.config.ts
COPY --from=builder /app/instrumentation.ts ./instrumentation.ts
COPY config/docker/entrypoint.sh /opt/carepulse/bin/entrypoint.sh
COPY config/docker/discover-postgresql.sh /opt/carepulse/bin/discover-postgresql.sh

RUN chmod +x /opt/carepulse/bin/entrypoint.sh /opt/carepulse/bin/discover-postgresql.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/usr/bin/tini", "--", "/opt/carepulse/bin/entrypoint.sh"]
CMD ["npm", "run", "start"]

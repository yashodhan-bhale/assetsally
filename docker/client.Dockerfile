# Build stage
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps/client ./apps/client

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the client app
RUN pnpm --filter @assetsally/client build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/apps/client/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next/static ./.next/static

USER nextjs

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

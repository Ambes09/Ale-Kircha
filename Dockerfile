# ============================================================
# Siga Kircha - Production Dockerfile
# ============================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy workspace files
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY apps/customer-bot/package.json apps/customer-bot/
COPY apps/admin-bot/package.json apps/admin-bot/
COPY apps/customer-web/package.json apps/customer-web/
COPY packages/shared/package.json packages/shared/
COPY packages/validation/package.json packages/validation/
COPY packages/i18n/package.json packages/i18n/
COPY packages/config/package.json packages/config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages
RUN pnpm -r build

# ============================================================
# Production Image
# ============================================================
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

COPY --from=builder /app/apps/customer-bot/dist ./apps/customer-bot/dist
COPY --from=builder /app/apps/customer-bot/package.json ./apps/customer-bot/
COPY --from=builder /app/apps/customer-bot/node_modules ./apps/customer-bot/node_modules

COPY --from=builder /app/apps/admin-bot/dist ./apps/admin-bot/dist
COPY --from=builder /app/apps/admin-bot/package.json ./apps/admin-bot/
COPY --from=builder /app/apps/admin-bot/node_modules ./apps/admin-bot/node_modules

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Environment variables
ENV NODE_ENV=production

# Expose ports
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then(r=>process.exit(r.ok?0:1))" || exit 1

# Start API
CMD ["node", "apps/api/dist/server.js"]

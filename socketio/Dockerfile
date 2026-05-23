FROM node:20-alpine AS base
RUN apk add --no-cache dumb-init
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 socketio

COPY --from=deps --chown=socketio:nodejs /app/node_modules ./node_modules
COPY --chown=socketio:nodejs server.js .

USER socketio
EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

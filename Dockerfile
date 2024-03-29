FROM node:lts-alpine AS base

WORKDIR /app

FROM base AS builder
WORKDIR /usr/src/perfil
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY src src
RUN npm run build
RUN npm prune --production


FROM base AS release
ENV NODE_ENV=production
COPY --from=builder /usr/src/perfil/node_modules ./node_modules
COPY --from=builder /usr/src/perfil/dist ./dist
RUN mkdir logs
USER node
CMD ["node","dist/server.js"]

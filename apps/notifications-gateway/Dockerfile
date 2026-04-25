FROM node:22-alpine AS build
WORKDIR /app
ENV HUSKY=0

COPY package*.json ./
RUN npm ci

COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY apps ./apps
COPY libs ./libs

RUN npm run build -- notifications-gateway

FROM node:22-alpine AS production-deps
WORKDIR /app
ENV HUSKY=0

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

CMD ["node", "dist/apps/notifications-gateway/main"]

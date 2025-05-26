# === Этап сборки ===
FROM node:22.8.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
# Генерируем Prisma client
RUN npx prisma generate

# Установка Nest CLI и сборка проекта
RUN npm install -g @nestjs/cli

COPY . .
RUN npm run build

# Проверка наличия main.js и seed.js
RUN ls -la /app/dist && ls -la /app/dist/prisma

# === Этап продакшена ===
FROM node:22.8.0-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

RUN npm install --omit=dev
RUN npx prisma generate

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
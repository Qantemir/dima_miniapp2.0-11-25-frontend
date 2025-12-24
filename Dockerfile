# Dockerfile для фронтенда Next.js
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и yarn.lock
COPY package.json yarn.lock ./

# Устанавливаем зависимости
RUN yarn install

# Копируем исходники
COPY . .

# Очищаем кэш Next.js перед сборкой (на случай если есть старые файлы)
RUN rm -rf .next node_modules/.cache

# Собираем Next.js приложение
RUN yarn build

# Production образ
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_VITE_API_URL=/api

# Копируем собранное приложение
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Запускаем Next.js standalone server
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]


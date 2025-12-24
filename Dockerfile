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
# NEXT_PUBLIC_VITE_API_URL должен быть установлен через переменные окружения Railway
# Не устанавливаем дефолтное значение здесь, чтобы не перезаписывать переменные из Railway
# Next.js standalone server будет использовать PORT из окружения Railway
# HOSTNAME=0.0.0.0 позволяет слушать на всех интерфейсах (важно для Docker/Railway)

# Копируем собранное приложение
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Запускаем Next.js standalone server
# Railway устанавливает PORT автоматически, не переопределяем
EXPOSE 8080

CMD ["node", "server.js"]


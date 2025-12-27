# Dockerfile для фронтенда Next.js
FROM node:20-alpine AS builder

WORKDIR /app

# Объявляем ARG для переменных окружения, которые нужны во время сборки
# Railway автоматически передает переменные окружения как build args
# Используем альтернативные имена для обратной совместимости (как в next.config.js)
ARG NEXT_PUBLIC_VITE_API_URL
ARG NEXT_PUBLIC_API_URL
ARG VITE_API_URL
ARG NEXT_PUBLIC_VITE_PUBLIC_URL
ARG VITE_PUBLIC_URL
ARG RAILWAY_PUBLIC_DOMAIN
ARG NEXT_PUBLIC_VITE_ADMIN_IDS
ARG VITE_ADMIN_IDS
ARG NEXT_PUBLIC_PAYMENT_LINK

# Устанавливаем переменные окружения из ARG для использования во время сборки
# Используем значение из NEXT_PUBLIC_* или альтернативное имя (аналогично next.config.js)
# API URL: поддерживаем NEXT_PUBLIC_API_URL > NEXT_PUBLIC_VITE_API_URL > VITE_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_VITE_API_URL=$NEXT_PUBLIC_VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
# Public URL: поддерживаем NEXT_PUBLIC_VITE_PUBLIC_URL > VITE_PUBLIC_URL > RAILWAY_PUBLIC_DOMAIN
ENV NEXT_PUBLIC_VITE_PUBLIC_URL=$NEXT_PUBLIC_VITE_PUBLIC_URL
ENV VITE_PUBLIC_URL=$VITE_PUBLIC_URL
ENV RAILWAY_PUBLIC_DOMAIN=$RAILWAY_PUBLIC_DOMAIN
# Admin IDs: поддерживаем NEXT_PUBLIC_VITE_ADMIN_IDS > VITE_ADMIN_IDS
ENV NEXT_PUBLIC_VITE_ADMIN_IDS=$NEXT_PUBLIC_VITE_ADMIN_IDS
ENV VITE_ADMIN_IDS=$VITE_ADMIN_IDS
# Payment Link
ENV NEXT_PUBLIC_PAYMENT_LINK=$NEXT_PUBLIC_PAYMENT_LINK

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


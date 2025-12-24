# Dockerfile для фронтенда Next.js
FROM node:20-alpine AS builder

WORKDIR /app

# Объявляем ARG для переменных окружения, которые нужны во время сборки
# Railway автоматически передает переменные окружения как build args
ARG NEXT_PUBLIC_VITE_API_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_VITE_PUBLIC_URL
ARG NEXT_PUBLIC_VITE_ADMIN_IDS

# Устанавливаем переменные окружения из ARG для использования во время сборки
ENV NEXT_PUBLIC_VITE_API_URL=$NEXT_PUBLIC_VITE_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_VITE_PUBLIC_URL=$NEXT_PUBLIC_VITE_PUBLIC_URL
ENV NEXT_PUBLIC_VITE_ADMIN_IDS=$NEXT_PUBLIC_VITE_ADMIN_IDS

# Копируем package.json и yarn.lock
COPY package.json yarn.lock ./

# Устанавливаем зависимости
RUN yarn install

# Копируем исходники
COPY . .

# Очищаем кэш Next.js перед сборкой (на случай если есть старые файлы)
RUN rm -rf .next node_modules/.cache

# Логируем переменные для отладки (во время сборки)
RUN echo "Build-time env vars:" && \
    echo "NEXT_PUBLIC_VITE_API_URL=$NEXT_PUBLIC_VITE_API_URL" && \
    echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"

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


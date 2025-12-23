# Frontend - Mini Shop

Next.js фронтенд для Telegram мини-приложения интернет-магазина.

## Технологии

- **Next.js 15** - React фреймворк
- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **TanStack Query** - управление состоянием и кэширование

## Структура проекта

```
frontend/
├── app/              # Next.js App Router страницы
│   ├── page.tsx      # Главная страница
│   ├── cart/         # Страница корзины
│   ├── checkout/     # Страница оформления заказа
│   ├── order/        # Страница заказа
│   └── admin/        # Админ панель
├── src/
│   ├── components/   # React компоненты
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Утилиты и API клиент
│   ├── contexts/     # React контексты
│   ├── pages/        # Компоненты страниц
│   └── types/        # TypeScript типы
├── public/           # Статические файлы
└── styles/           # Глобальные стили
```

## Установка

```bash
# Установить зависимости
yarn install
```

## Разработка

```bash
# Запустить dev сервер
yarn dev

# Приложение будет доступно на http://localhost:3000
```

## Сборка

```bash
# Собрать production версию
yarn build

# Запустить production сервер
yarn start
```

## Docker

### Сборка Docker образа

```bash
docker build -t frontend-app .
docker run -p 3000:3000 --env-file .env frontend-app
```

## Переменные окружения

Создайте `.env.local` файл:

```env
# API URL
NEXT_PUBLIC_VITE_API_URL=/api
# или для внешнего API:
# NEXT_PUBLIC_VITE_API_URL=https://api.example.com/api

# Public URL
NEXT_PUBLIC_VITE_PUBLIC_URL=http://localhost:3000

# Admin IDs
NEXT_PUBLIC_VITE_ADMIN_IDS=123456789,987654321
```

## API Клиент

Все запросы к API выполняются через клиент в `src/lib/api.ts`:

```typescript
import { api } from '@/lib/api';

// Получить каталог
const catalog = await api.getCatalog();

// Добавить в корзину
await api.addToCart({ product_id: '123', quantity: 1 });

// Создать заказ
await api.createOrder({ ... });
```

## Структура страниц

- `/` - Главная страница (каталог)
- `/cart` - Корзина
- `/checkout` - Оформление заказа
- `/order/:id` - Детали заказа
- `/admin` - Админ панель
  - `/admin/orders` - Список заказов
  - `/admin/catalog` - Управление каталогом
  - `/admin/store` - Настройки магазина
  - `/admin/broadcast` - Рассылка
  - `/admin/payments` - Настройки оплаты

## Production развертывание

### Vercel / Netlify

Проект можно развернуть на Vercel или Netlify:

1. Подключите репозиторий
2. Установите переменные окружения
3. Деплой произойдет автоматически

### Docker

Используйте `Dockerfile` для развертывания на любом Docker-хостинге.

### Настройка API URL

В production убедитесь, что `NEXT_PUBLIC_VITE_API_URL` указывает на ваш бэкенд API.

# dima_miniapp2.0-11-25-frontend
# dima_miniapp2.0-11-25-frontend

/* eslint-disable */
/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  // Оптимизация изображений
  images: {
    unoptimized: true, // Отключаем оптимизацию для статики
  },
  // Переменные окружения для клиентской стороны (с префиксом NEXT_PUBLIC_)
  // ВАЖНО: Эти переменные инжектируются во время сборки, не во время выполнения!
  // Убедитесь, что NEXT_PUBLIC_API_URL или NEXT_PUBLIC_VITE_API_URL установлена в Railway ДО сборки
  env: {
    // Поддерживаем оба варианта: стандартный NEXT_PUBLIC_API_URL и старый NEXT_PUBLIC_VITE_API_URL для совместимости
    // Читаем переменную напрямую - если не установлена, будет undefined
    // Код в src/types/api.ts будет использовать fallback '/api' только если переменная действительно не установлена
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_VITE_API_URL || process.env.VITE_API_URL || undefined,
    NEXT_PUBLIC_VITE_API_URL: process.env.NEXT_PUBLIC_VITE_API_URL || process.env.VITE_API_URL || undefined, // Для обратной совместимости
    // Нормализуем PUBLIC_URL - добавляем протокол если его нет (для RAILWAY_PUBLIC_DOMAIN)
    NEXT_PUBLIC_VITE_PUBLIC_URL: (() => {
      const url = process.env.NEXT_PUBLIC_VITE_PUBLIC_URL || process.env.VITE_PUBLIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN;
      if (!url) return 'http://localhost:3000';
      const trimmed = url.trim();
      if (!trimmed) return 'http://localhost:3000';
      // Если уже есть протокол, возвращаем как есть
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
      // Если нет протокола, добавляем https://
      return `https://${trimmed}`;
    })(),
    // Для ADMIN_IDS не используем пустую строку как fallback, чтобы можно было определить отсутствие переменной
    // Если переменная не установлена, будет undefined, что позволит getEnvVar правильно обработать ситуацию
    NEXT_PUBLIC_VITE_ADMIN_IDS: process.env.NEXT_PUBLIC_VITE_ADMIN_IDS || process.env.VITE_ADMIN_IDS || undefined,
    // Ссылка на оплату (Kaspi Pay или другой платёжный сервис)
    NEXT_PUBLIC_PAYMENT_LINK: process.env.NEXT_PUBLIC_PAYMENT_LINK || undefined,
  },
  // Настройка для API прокси
  async rewrites() {
    // В production на Railway фронтенд и бэкенд - разные сервисы
    // Поддерживаем оба варианта: NEXT_PUBLIC_API_URL (рекомендуется) и NEXT_PUBLIC_VITE_API_URL (для совместимости)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_VITE_API_URL || process.env.VITE_API_URL;
    
    // Если apiUrl указан и это НЕ относительный путь (не начинается с /),
    // значит это внешний URL. Next.js rewrites НЕ МОГУТ проксировать на внешние URL между контейнерами.
    // ОТКЛЮЧАЕМ rewrites полностью - клиент будет использовать полный URL напрямую.
    if (apiUrl) {
      let normalizedApiUrl = String(apiUrl).trim();
      normalizedApiUrl = normalizedApiUrl.replace(/^["']|["']$/g, '');
      
      // Если это полный URL (начинается с http:// или https://)
      if (normalizedApiUrl.startsWith('http://') || normalizedApiUrl.startsWith('https://')) {
        return [];
      }
      
      // Если это голый домен (не начинается с /), значит это внешний URL
      // ОТКЛЮЧАЕМ rewrites - клиент будет использовать полный URL
      if (!normalizedApiUrl.startsWith('/')) {
        return [];
      }
      
      // Если это относительный путь (/api), значит фронтенд и бэкенд в одном контейнере
      // Используем внутренний прокси на localhost
      const backendPort = process.env.PORT || process.env.BACKEND_PORT || '8080';
      return [
        {
          source: '/api/:path*',
          destination: `http://localhost:${backendPort}/api/:path*`,
        },
      ];
    }
    
    // FALLBACK: Если переменная не установлена, отключаем rewrites
    // Клиент будет использовать API_BASE_URL из src/types/api.ts (который будет '/api' по умолчанию)
    return [];
  },
  // Оптимизация сборки
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Экспериментальные функции для производительности
  experimental: {
    optimizePackageImports: [
      '@headlessui/react',
      'lucide-react',
      'framer-motion',
    ],
  },
  // Указываем корень проекта для устранения предупреждения о workspace
  outputFileTracingRoot: path.join(__dirname),
  // Временно отключаем проверку типов во время сборки для обхода бага Next.js с генерацией типов
  typescript: {
    ignoreBuildErrors: true,
  },
  // Убираем pageExtensions - Next.js App Router автоматически распознает все нужные файлы
  // Компоненты страниц находятся в src/components/page-components, чтобы Next.js не искал их как Pages Router
  // App Router использует файловую систему маршрутизацию и не требует pageExtensions
  // Production output для интеграции с FastAPI
  output: 'standalone',
};

module.exports = nextConfig;


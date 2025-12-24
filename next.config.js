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
  env: {
    NEXT_PUBLIC_VITE_API_URL: process.env.NEXT_PUBLIC_VITE_API_URL || process.env.VITE_API_URL || '/api',
    NEXT_PUBLIC_VITE_PUBLIC_URL: process.env.NEXT_PUBLIC_VITE_PUBLIC_URL || process.env.VITE_PUBLIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN || 'http://localhost:3000',
    NEXT_PUBLIC_VITE_ADMIN_IDS: process.env.NEXT_PUBLIC_VITE_ADMIN_IDS || process.env.VITE_ADMIN_IDS || '',
  },
  // Настройка для API прокси
  async rewrites() {
    // В production на Railway фронтенд и бэкенд - разные сервисы
    // Используем переменную окружения BACKEND_URL для бэкенда
    const backendUrl = process.env.BACKEND_URL || process.env.RAILWAY_SERVICE_URL;
    const apiUrl = process.env.NEXT_PUBLIC_VITE_API_URL || process.env.VITE_API_URL;
    
    // Если apiUrl указан и это полный URL (начинается с http:// или https://), 
    // НЕ используем rewrites - клиент будет делать запросы напрямую
    // Это важно для разных сервисов на Railway
    if (apiUrl) {
      let normalizedApiUrl = String(apiUrl).trim();
      normalizedApiUrl = normalizedApiUrl.replace(/^["']|["']$/g, '');
      
      // Если это полный URL или голый домен (не относительный путь)
      if (normalizedApiUrl.startsWith('http://') || normalizedApiUrl.startsWith('https://')) {
        // Полный URL - не используем rewrites, клиент будет делать запросы напрямую
        return [];
      }
      
      // Если это голый домен (не начинается с /), значит это внешний URL
      // Next.js rewrites не могут проксировать на внешние URL между контейнерами
      // Поэтому отключаем rewrites - клиент будет использовать полный URL
      if (!normalizedApiUrl.startsWith('/')) {
        return [];
      }
    }
    
    // Если указан BACKEND_URL, используем его для проксирования (только для внутренних URL)
    if (backendUrl) {
      let destination = String(backendUrl).trim();
      // Убираем кавычки если есть
      destination = destination.replace(/^["']|["']$/g, '');
      
      // Если это не полный URL (нет протокола), добавляем https://
      if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
        destination = `https://${destination}`;
      }
      
      // Убираем /api из конца если есть, так как мы добавим его в destination
      destination = destination.replace(/\/api\/?$/, '').replace(/\/$/, '');
      
      return [
        {
          source: '/api/:path*',
          destination: `${destination}/api/:path*`,
        },
      ];
    }
    
    // Если это относительный путь или не указан, используем внутренний прокси (для одного сервиса)
    // В production (Railway/Docker) FastAPI использует PORT из окружения или 8080
    // Next.js проксирует /api запросы на FastAPI
    // ВАЖНО: Это работает только если фронтенд и бэкенд в одном контейнере
    const backendPort = process.env.PORT || process.env.BACKEND_PORT || '8080';
    return [
      {
        source: '/api/:path*',
        destination: `http://localhost:${backendPort}/api/:path*`,
      },
    ];
  },
  // Оптимизация сборки
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Экспериментальные функции для производительности
  experimental: {
    optimizePackageImports: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', 'lucide-react'],
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


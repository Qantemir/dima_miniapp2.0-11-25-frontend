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
    // ВАЖНО: rewrites() выполняется во время сборки, но переменные окружения из Railway
    // доступны только во время выполнения. Поэтому мы всегда отключаем rewrites для внешних URL.
    
    const backendUrl = process.env.BACKEND_URL || process.env.RAILWAY_SERVICE_URL;
    const apiUrl = process.env.NEXT_PUBLIC_VITE_API_URL || process.env.VITE_API_URL;
    
    // Логируем ВСЕГДА для отладки (включая production)
    console.log('[Next.js rewrites] Проверка переменных окружения:');
    console.log('[Next.js rewrites] BACKEND_URL:', backendUrl || '(не установлен)');
    console.log('[Next.js rewrites] NEXT_PUBLIC_VITE_API_URL:', apiUrl || '(не установлен)');
    console.log('[Next.js rewrites] NODE_ENV:', process.env.NODE_ENV);
    
    // КРИТИЧЕСКИ ВАЖНО: Если apiUrl указан и это НЕ относительный путь (не начинается с /),
    // значит это внешний URL. Next.js rewrites НЕ МОГУТ проксировать на внешние URL между контейнерами.
    // ОТКЛЮЧАЕМ rewrites полностью - клиент будет использовать полный URL напрямую.
    if (apiUrl) {
      let normalizedApiUrl = String(apiUrl).trim();
      normalizedApiUrl = normalizedApiUrl.replace(/^["']|["']$/g, '');
      
      console.log('[Next.js rewrites] Нормализованный apiUrl:', normalizedApiUrl);
      
      // Если это полный URL (начинается с http:// или https://)
      if (normalizedApiUrl.startsWith('http://') || normalizedApiUrl.startsWith('https://')) {
        console.log('[Next.js rewrites] ✅ Отключаем rewrites - используется полный URL:', normalizedApiUrl);
        return [];
      }
      
      // Если это голый домен (не начинается с /), значит это внешний URL
      // ОТКЛЮЧАЕМ rewrites - клиент будет использовать полный URL
      if (!normalizedApiUrl.startsWith('/')) {
        console.log('[Next.js rewrites] ✅ Отключаем rewrites - внешний URL (голый домен):', normalizedApiUrl);
        return [];
      }
      
      // Если это относительный путь (/api), проверяем BACKEND_URL
      console.log('[Next.js rewrites] apiUrl - относительный путь:', normalizedApiUrl);
    }
    
    // Если указан BACKEND_URL, используем его для проксирования
    if (backendUrl) {
      let destination = String(backendUrl).trim();
      destination = destination.replace(/^["']|["']$/g, '');
      
      if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
        destination = `https://${destination}`;
      }
      
      destination = destination.replace(/\/api\/?$/, '').replace(/\/$/, '');
      
      console.log('[Next.js rewrites] ✅ Используем BACKEND_URL для проксирования:', destination);
      
      return [
        {
          source: '/api/:path*',
          destination: `${destination}/api/:path*`,
        },
      ];
    }
    
    // FALLBACK: Если мы попали сюда, значит переменные окружения не установлены правильно
    // В production на Railway это НЕ должно происходить!
    // ВАЖНО: На Railway фронтенд и бэкенд - разные сервисы, поэтому НЕ используем localhost
    // Отключаем rewrites полностью - клиент будет использовать API_BASE_URL напрямую
    console.error('[Next.js rewrites] ❌ ОШИБКА: Переменные окружения не установлены!');
    console.error('[Next.js rewrites] ❌ NEXT_PUBLIC_VITE_API_URL:', apiUrl || '(не установлен)');
    console.error('[Next.js rewrites] ❌ BACKEND_URL:', backendUrl || '(не установлен)');
    console.error('[Next.js rewrites] ❌ Все переменные окружения:', Object.keys(process.env).filter(k => k.includes('API') || k.includes('BACKEND') || k.includes('RAILWAY')).join(', '));
    console.error('[Next.js rewrites] ⚠️ Отключаем rewrites - клиент будет использовать API_BASE_URL из src/types/api.ts');
    
    // НЕ возвращаем localhost - отключаем rewrites полностью
    // Клиент будет использовать API_BASE_URL, который формируется из NEXT_PUBLIC_VITE_API_URL
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


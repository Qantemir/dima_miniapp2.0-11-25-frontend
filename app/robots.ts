import { MetadataRoute } from 'next';

// Нормализуем URL - добавляем протокол если его нет
const normalizeUrl = (url: string | undefined): string => {
  if (!url) return 'https://miniapp.local';
  const trimmed = url.trim();
  if (!trimmed) return 'https://miniapp.local';
  // Если уже есть протокол, возвращаем как есть
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // Если нет протокола, добавляем https://
  return `https://${trimmed}`;
};

export default function robots(): MetadataRoute.Robots {
  const baseUrl = normalizeUrl(
    process.env.NEXT_PUBLIC_VITE_PUBLIC_URL || 
    process.env.VITE_PUBLIC_URL || 
    process.env.RAILWAY_PUBLIC_DOMAIN
  );
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}


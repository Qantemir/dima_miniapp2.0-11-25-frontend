import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/react-query';
import type { CatalogResponse } from '@/types/api';

export const CATALOG_QUERY_KEY = queryKeys.catalog;

/**
 * Хук для получения каталога товаров
 * 
 * Оптимизирован для производительности:
 * - staleTime: 2 минуты (из глобальной конфигурации)
 * - refetchOnMount: false (использует кэш если данные свежие)
 * - refetchOnWindowFocus: false (экономит запросы)
 */
export function useCatalog() {
  return useQuery<CatalogResponse>({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: async () => {
      try {
        return await api.getCatalog();
      } catch (error) {
        // Если сервер вернул 304 Not Modified, данные не изменились
        // React Query будет использовать кэшированные данные через staleTime
        if (error instanceof Error && error.message === 'NOT_MODIFIED') {
          // Бросаем ошибку, но React Query использует кэш если данные свежие
          // Это работает благодаря staleTime: 10 минут
          throw error;
        }
        throw error;
      }
    },
    // Увеличенный staleTime для каталога - данные меняются редко
    staleTime: 10 * 60 * 1000, // 10 минут - данные считаются свежими (увеличено для производительности)
    gcTime: 15 * 60 * 1000, // 15 минут кэш
    // Не перезапрашивать автоматически
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // Если данные свежие (staleTime), React Query вернет кэш даже при ошибке
    throwOnError: false, // Не бросать ошибку, если данные в кэше свежие
  });
}


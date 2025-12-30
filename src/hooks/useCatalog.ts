 'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/react-query';
import type { CatalogResponse } from '@/types/api';

export const CATALOG_QUERY_KEY = queryKeys.catalog;

/**
 * Хук для получения каталога товаров
 * 
 * Оптимизирован для производительности:
 * - staleTime: 2 минуты - баланс между актуальностью и производительностью
 * - refetchOnMount: false (использует кэш если данные свежие)
 * - refetchOnWindowFocus: false (экономит запросы)
 */
export function useCatalog() {
  return useQuery<CatalogResponse>({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: () => api.getCatalog(),
    // Оптимизированный staleTime для каталога - баланс между актуальностью и производительностью
    staleTime: 2 * 60 * 1000, // 2 минуты - данные считаются свежими
    gcTime: 15 * 60 * 1000, // 15 минут кэш
    // Не перезапрашивать автоматически
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // Если сервер вернул 304 Not Modified, React Query использует кэш через staleTime
    // Благодаря staleTime (2 минуты), кэш будет использован даже при ошибке 304
    retry: (failureCount, error) => {
      // Не повторять запрос при 304 Not Modified
      if (error instanceof Error && error.message === 'NOT_MODIFIED') {
        return false;
      }
      return failureCount < 1; // Одна попытка повтора для других ошибок
    },
  });
}


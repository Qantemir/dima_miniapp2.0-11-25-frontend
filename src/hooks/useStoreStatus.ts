/**
 * Хук для работы со статусом магазина
 * Использует React Query для кэширования и оптимизации запросов
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/react-query';
import type { StoreStatus } from '@/types/api';

/**
 * Хук для получения статуса магазина
 * 
 * Оптимизирован для производительности:
 * - Использует React Query для кэширования
 * - Автоматический polling каждые 60 секунд
 * - Кэш на 60 секунд (синхронизировано с серверным кэшем)
 */
export function useStoreStatus() {
  const {
    data: status,
    isLoading: loading,
    refetch: refresh,
  } = useQuery<StoreStatus>({
    queryKey: queryKeys.storeStatus,
    queryFn: () => api.getStoreStatus(),
    staleTime: 2 * 60 * 1000, // 2 минуты - статус меняется редко
    gcTime: 5 * 60 * 1000, // 5 минут кэш
    refetchInterval: 2 * 60 * 1000, // Автоматический polling каждые 2 минуты (увеличено с 60 сек)
    refetchOnWindowFocus: true, // Обновлять при возврате на вкладку
    refetchOnMount: true, // Обновлять при монтировании
  });

  return {
    status: status || null,
    loading,
    refresh: async () => {
      await refresh();
    },
  };
}


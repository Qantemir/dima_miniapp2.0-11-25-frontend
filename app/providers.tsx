'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { queryClient, queryKeys } from '@/lib/react-query';
import { AdminViewProvider } from '@/contexts/AdminViewContext';
import { StoreStatusProvider } from '@/contexts/StoreStatusContext';
import { StoreSleepOverlay } from '@/components/StoreSleepOverlay';
import { initTelegram } from '@/lib/telegram';
import { api } from '@/lib/api';

// Динамический импорт ReactQueryDevtools только в development, чтобы не включать его в production bundle
const ReactQueryDevtools = process.env.NODE_ENV === 'development'
  ? dynamic(() => import('@tanstack/react-query-devtools').then(mod => mod.ReactQueryDevtools), {
      ssr: false,
    })
  : () => null;

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;

  return (
    <QueryClientProvider client={queryClient}>
      <AdminViewProvider>
        <StoreStatusProvider>
          <InitTelegram />
          {children}
          {!isAdminRoute && <StoreSleepOverlay />}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </StoreStatusProvider>
      </AdminViewProvider>
    </QueryClientProvider>
  );
}

function InitTelegram() {
  const queryClient = useQueryClient();

  useEffect(() => {
    initTelegram();

    // Prefetch критичных данных при старте приложения
    const prefetchCriticalData = async () => {
      try {
        await queryClient.prefetchQuery({
          queryKey: queryKeys.catalog,
          queryFn: () => api.getCatalog(),
          staleTime: 5 * 60 * 1000,
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('Prefetch error:', error);
        }
      }
    };

    prefetchCriticalData();
  }, [queryClient]);

  return null;
}


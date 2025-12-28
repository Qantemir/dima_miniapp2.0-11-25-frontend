'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CatalogPage } from '@pages/CatalogPage';
import { getUserId, isAdmin, waitForTelegramInitData } from '@/lib/telegram';
import { ADMIN_IDS } from '@/types/api';
import { useAdminView } from '@/contexts/AdminViewContext';

export default function HomePage() {
  const router = useRouter();
  const { forceClientView } = useAdminView();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  // Ждем загрузки данных Telegram перед проверкой админа
  useEffect(() => {
    const checkAdmin = async () => {
      // Ждем инициализации Telegram данных (максимум 2 секунды)
      await waitForTelegramInitData(2000);
      const currentUserId = getUserId();
      setUserId(currentUserId);
      setChecking(false);
    };
    checkAdmin();
  }, []);

  const isUserAdmin = userId ? isAdmin(userId, ADMIN_IDS) : false;

  useEffect(() => {
    // Перенаправляем на админку админов
    if (!checking && isUserAdmin && !forceClientView) {
      router.replace('/admin');
    }
  }, [checking, isUserAdmin, forceClientView, router]);

  // Показываем загрузку пока проверяем админа
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Редирект обрабатывается для админов
  if (isUserAdmin && !forceClientView) {
    return null; // Редирект обрабатывается
  }

  return <CatalogPage />;
}


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CatalogPage } from '@pages/CatalogPage';
import { getUserId, isAdmin, isOnlyBackupUser, waitForTelegramInitData } from '@/lib/telegram';
import { ADMIN_IDS, BACKUP_USER_IDS } from '@/types/api';
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
  // Проверяем, является ли пользователь ТОЛЬКО backup user (не админ)
  const isUserOnlyBackup = userId ? isOnlyBackupUser(userId, ADMIN_IDS, BACKUP_USER_IDS) : false;

  useEffect(() => {
    // Перенаправляем на админку только настоящих админов (не backup users)
    // Backup users должны иметь доступ только к странице backup, но не к админке
    if (!checking && isUserAdmin && !isUserOnlyBackup && !forceClientView) {
      router.replace('/admin');
    }
  }, [checking, isUserAdmin, isUserOnlyBackup, forceClientView, router]);

  // Показываем загрузку пока проверяем админа
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Редирект обрабатывается для админов (но не для backup users)
  if (isUserAdmin && !isUserOnlyBackup && !forceClientView) {
    return null; // Редирект обрабатывается
  }

  return <CatalogPage />;
}


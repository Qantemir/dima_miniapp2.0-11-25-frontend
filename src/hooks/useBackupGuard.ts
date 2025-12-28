import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@/lib/router';
import { getUserId, isAdmin, isBackupUser, showBackButton, hideBackButton } from '@/lib/telegram';
import { ADMIN_IDS, BACKUP_USER_IDS } from '@/types/api';
import { toast } from '@/lib/toast';

/**
 * Проверка прав доступа к функциям бэкапа.
 * Доступ имеют:
 * - Администраторы (из ADMIN_IDS)
 * - Backup users (из BACKUP_USER_IDS)
 * 
 * Показывает/прячет телеграм-кнопку «Назад» и перенаправляет неавторизованных.
 */
export const useBackupGuard = (backPath: string = '/') => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const notifiedRef = useRef(false);

  useEffect(() => {
    const userId = getUserId();
    const isUserAdmin = userId ? isAdmin(userId, ADMIN_IDS) : false;
    const isUserBackup = userId ? isBackupUser(userId, BACKUP_USER_IDS) : false;

    // Доступ имеют админы и backup users
    if (!isUserAdmin && !isUserBackup) {
      if (!notifiedRef.current) {
        toast.error('Доступ запрещён. Требуются права администратора или права доступа к бэкапу.');
        notifiedRef.current = true;
      }
      navigate('/');
      return;
    }

    setAuthorized(true);
  }, [navigate]);

  useEffect(() => {
    if (!authorized) return;
    showBackButton(() => navigate(backPath));
    return () => {
      hideBackButton();
    };
  }, [authorized, backPath, navigate]);

  return authorized;
};


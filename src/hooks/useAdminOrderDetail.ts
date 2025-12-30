 'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@/lib/router';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { API_BASE_URL } from '@/types/api';
import { toast } from '@/lib/toast';
import type { Order, OrderStatus } from '@/types/api';
import { useAdminGuard } from './useAdminGuard';

export const useAdminOrderDetail = (orderId?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthorized = useAdminGuard('/admin');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [savedRejectionReason, setSavedRejectionReason] = useState<string>('');

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadOrder = async () => {
      try {
        setLoading(true);
        const data = await api.getAdminOrder(orderId);
        if (!cancelled) {
          setOrder(data);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error('Ошибка загрузки заказа');
          navigate('/admin');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [isAuthorized, orderId, navigate]);

  const handleStatusSelect = useCallback(
    (newStatus: OrderStatus) => {
      if (!order || newStatus === order.status) {
        return;
      }
      setPendingStatus(newStatus);
      // Сбрасываем сохраненную причину отказа при выборе нового статуса
      if (newStatus !== 'отказано') {
        setSavedRejectionReason('');
      }
      setStatusDialogOpen(true);
    },
    [order],
  );

  const confirmStatusChange = useCallback(async (rejectionReason?: string) => {
    if (!order || !pendingStatus || updating) {
      return;
    }

    const targetStatus = pendingStatus;
    
    // Валидация причины отказа ДО закрытия диалога
    if (targetStatus === 'отказано') {
      if (!rejectionReason || rejectionReason.trim().length === 0) {
        toast.error('Необходимо указать причину отказа');
        setUpdating(false);
        return;
      }
      // Сохраняем причину отказа на случай ошибки
      setSavedRejectionReason(rejectionReason.trim());
    }

    setUpdating(true);
    // НЕ закрываем диалог здесь, чтобы сохранить введенную причину отказа

    try {
      // Формируем данные для запроса
      const updateData: { status: OrderStatus; rejection_reason?: string } = {
        status: targetStatus,
      };
      
      // Добавляем причину отказа
      if (targetStatus === 'отказано' && rejectionReason) {
        updateData.rejection_reason = rejectionReason.trim();
      }

      const updatedOrder = await api.updateOrderStatus(order.id, updateData);
      setOrder(updatedOrder);
      toast.success('Статус заказа обновлён');
      // Закрываем диалог только после успешного обновления
      setStatusDialogOpen(false);
      setPendingStatus(null);
      setSavedRejectionReason('');
    } catch (error: any) {
      const errorMessage = error?.message || error?.detail || 'Ошибка при обновлении статуса';
      toast.error(errorMessage);
      // Диалог остается открытым, причина отказа сохранена
    } finally {
      setUpdating(false);
    }
  }, [order, pendingStatus, updating]);

  const handleStatusDialogChange = useCallback(
    (open: boolean) => {
      setStatusDialogOpen(open);
      if (!open && !updating) {
        setPendingStatus(null);
        setSavedRejectionReason('');
      }
    },
    [updating],
  );

  const goBack = useCallback(() => navigate('/admin'), [navigate]);

  const handleDeleteClick = useCallback(() => {
    if (!order || updating) {
      return;
    }
    setDeleteDialogOpen(true);
  }, [order, updating]);

  const confirmDeleteOrder = useCallback(async () => {
    if (!order || updating) {
      return;
    }

    setUpdating(true);
    setDeleteDialogOpen(false);
    try {
      await api.deleteOrder(order.id);
      // Инвалидируем кэш списка заказов для всех статусов, чтобы удаленный заказ сразу исчез
      await queryClient.invalidateQueries({ 
        queryKey: ['admin-orders'],
        refetchType: 'active', // Обновить только активные запросы
      });
      toast.success('Заказ удалён');
      navigate('/admin/orders');
    } catch (error) {
      toast.error('Ошибка при удалении заказа');
    } finally {
      setUpdating(false);
    }
  }, [order, updating, navigate, queryClient]);

  const handleDeleteDialogChange = useCallback(
    (open: boolean) => {
      setDeleteDialogOpen(open);
      if (!open && !updating) {
        // Диалог закрыт, ничего не делаем
      }
    },
    [updating],
  );

  const openChatWithCustomer = useCallback(() => {
    if (!order?.user_id) {
      return;
    }

    const chatLink = `tg://user?id=${order.user_id}`;
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    
    if (tg && typeof tg.openTelegramLink === 'function') {
      // Открываем через мини-апп
      tg.openTelegramLink(chatLink);
    } else {
      // Fallback для веб-версии
      window.open(chatLink, '_blank');
    }
  }, [order]);

  const receiptUrl = useMemo(() => {
    if (!order?.payment_receipt_file_id || !orderId) {
      return null;
    }
    // Формируем URL для получения чека через админский endpoint
    // Используем тот же подход, что и в ApiClient.request для формирования URL
    const baseUrl = API_BASE_URL;
    if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
      const base = baseUrl.replace(/\/app\/api/, '/api');
      return `${base}/admin/order/${orderId}/receipt`;
    }
    return `${baseUrl}/admin/order/${orderId}/receipt`;
  }, [order, orderId]);

  const shortOrderId = order ? order.id.slice(-6) : '';
  const createdAtLabel = order
    ? new Date(order.created_at).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const seoPath = orderId ? `/admin/order/${orderId}` : '/admin/order';
  const seoTitle = order ? `Админ: Заказ ${shortOrderId}` : 'Админ: Заказ';

  return {
    loading,
    order,
    updating,
    pendingStatus,
    statusDialogOpen,
    deleteDialogOpen,
    savedRejectionReason,
    receiptUrl,
    shortOrderId,
    createdAtLabel,
    seoPath,
    seoTitle,
    handleStatusSelect,
    confirmStatusChange,
    handleStatusDialogChange,
    goBack,
    handleDeleteClick,
    confirmDeleteOrder,
    handleDeleteDialogChange,
    openChatWithCustomer,
  };
};

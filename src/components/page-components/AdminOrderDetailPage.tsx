'use client';

import { useParams } from '@/lib/router';
import type { OrderStatus } from '@/types/api';
import { Seo } from '@/components/Seo';
import { AdminOrderDetailSkeleton } from '@/components/admin/orders/AdminOrderDetailSkeleton';
import { AdminOrderDetailNotFound } from '@/components/admin/orders/AdminOrderDetailNotFound';
import { AdminOrderDetailView } from '@/components/admin/orders/AdminOrderDetailView';
import { AdminOrderStatusDialog } from '@/components/admin/orders/AdminOrderStatusDialog';
import { AdminOrderDeleteDialog } from '@/components/admin/orders/AdminOrderDeleteDialog';
import { useAdminOrderDetail } from '@/hooks/useAdminOrderDetail';

const AVAILABLE_STATUSES: OrderStatus[] = [
  'новый',
  'принят',
  'отказано',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  'новый': 'Новый',
  'принят': 'Принят',
  'отказано': 'Отказано',
};

export const AdminOrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const {
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
  } = useAdminOrderDetail(orderId);

  if (loading) {
    return (
      <>
        <Seo title={seoTitle} description="Просматривайте информацию о заказе." path={seoPath} noIndex />
        <AdminOrderDetailSkeleton />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Seo title="Админ: Заказ" description="Заказ не найден." path={seoPath} noIndex />
        <AdminOrderDetailNotFound />
      </>
    );
  }

  return (
    <>
      <Seo title={seoTitle} description="Изменяйте статус и просматривайте детали заказа." path={seoPath} noIndex />
      <AdminOrderDetailView
        order={order}
        shortOrderId={shortOrderId}
        createdAtLabel={createdAtLabel}
        receiptUrl={receiptUrl}
        availableStatuses={AVAILABLE_STATUSES}
        statusLabels={STATUS_LABELS}
        updating={updating}
        onStatusSelect={handleStatusSelect}
        onBack={goBack}
        onDelete={handleDeleteClick}
      />

      <AdminOrderStatusDialog
        open={statusDialogOpen}
        pendingStatus={pendingStatus}
        statusLabels={STATUS_LABELS}
        updating={updating}
        initialRejectionReason={savedRejectionReason}
        onConfirm={confirmStatusChange}
        onOpenChange={handleStatusDialogChange}
      />

      <AdminOrderDeleteDialog
        open={deleteDialogOpen}
        orderId={order.id}
        deleting={updating}
        onOpenChange={handleDeleteDialogChange}
        onConfirm={confirmDeleteOrder}
      />
    </>
  );
};

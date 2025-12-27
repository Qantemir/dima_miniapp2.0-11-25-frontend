import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { OrderStatus } from '@/types/api';

interface AdminOrderStatusDialogProps {
  open: boolean;
  pendingStatus: OrderStatus | null;
  statusLabels: Record<OrderStatus, string>;
  updating: boolean;
  onConfirm: (rejectionReason?: string) => void;
  onOpenChange: (open: boolean) => void;
}

export const AdminOrderStatusDialog = ({
  open,
  pendingStatus,
  statusLabels,
  updating,
  onConfirm,
  onOpenChange,
}: AdminOrderStatusDialogProps) => {
  const [rejectionReason, setRejectionReason] = useState('');

  // Сбрасываем причину отказа при закрытии или смене статуса
  useEffect(() => {
    if (!open) {
      setRejectionReason('');
    }
  }, [open, pendingStatus]);

  const requiresReason = pendingStatus === 'отказано';
  const canConfirm = pendingStatus && (!requiresReason || rejectionReason.trim().length > 0);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Изменить статус заказа?</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingStatus
              ? `Установить статус "${statusLabels[pendingStatus]}"?`
              : 'Выберите статус, чтобы изменить его.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {requiresReason && (
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Причина отказа *</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Укажите причину отказа заказа..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              disabled={updating}
              rows={3}
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={updating}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            disabled={!canConfirm || updating}
            onClick={event => {
              event.preventDefault();
              onConfirm(requiresReason ? rejectionReason.trim() : undefined);
            }}
          >
            Изменить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


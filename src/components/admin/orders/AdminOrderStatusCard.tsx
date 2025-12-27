import type { OrderStatus } from '@/types/api';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { AdminSectionCard } from '@/components/admin/AdminSectionCard';

interface AdminOrderStatusCardProps {
  status: OrderStatus;
  rejectionReason?: string;
}

export const AdminOrderStatusCard = ({ status, rejectionReason }: AdminOrderStatusCardProps) => (
  <AdminSectionCard ariaLabel="Текущий статус">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Текущий статус:</span>
        <OrderStatusBadge status={status} />
      </div>
      {status === 'отказано' && rejectionReason && (
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground mb-1">Причина отказа:</p>
          <p className="text-sm text-destructive">{rejectionReason}</p>
        </div>
      )}
    </div>
  </AdminSectionCard>
);


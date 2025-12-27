import type { OrderStatus } from '@/types/api';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'принят':
        return { label: 'Принят', className: 'bg-success/10 text-success' };
      case 'отказано':
        return { label: 'Отказано', className: 'bg-destructive/10 text-destructive' };
      default:
        return { label: status, className: 'bg-muted text-muted-foreground' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

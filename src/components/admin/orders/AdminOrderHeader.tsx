import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from '@/components/icons';

interface AdminOrderHeaderProps {
  shortOrderId: string;
  createdAt: string;
  onBack: () => void;
  onDelete?: () => void;
}

export const AdminOrderHeader = ({ 
  shortOrderId, 
  createdAt, 
  onBack,
  onDelete,
}: AdminOrderHeaderProps) => (
  <header className="bg-card border-b border-border p-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Назад к списку заказов">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Заказ #{shortOrderId}</h1>
          <p className="text-sm text-muted-foreground">{createdAt}</p>
        </div>
      </div>
      {onDelete && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onDelete} 
          aria-label="Удалить заказ"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      )}
    </div>
  </header>
);


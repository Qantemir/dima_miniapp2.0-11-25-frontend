import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, MessageCircle, Trash2 } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminOrderHeaderProps {
  shortOrderId: string;
  createdAt: string;
  onBack: () => void;
  onChat?: () => void;
  onDelete?: () => void;
}

export const AdminOrderHeader = ({ 
  shortOrderId, 
  createdAt, 
  onBack,
  onChat,
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
      {(onChat || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Дополнительные действия">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onChat && (
              <DropdownMenuItem onClick={onChat}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Чат с клиентом
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить заказ
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  </header>
);


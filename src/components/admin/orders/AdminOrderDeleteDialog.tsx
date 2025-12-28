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

interface AdminOrderDeleteDialogProps {
  open: boolean;
  orderId?: string;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const AdminOrderDeleteDialog = ({
  open,
  orderId,
  deleting,
  onOpenChange,
  onConfirm,
}: AdminOrderDeleteDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Удалить заказ?</AlertDialogTitle>
        <AlertDialogDescription>
          {orderId
            ? `Заказ #${orderId.slice(-6)} будет удалён без возможности восстановления.`
            : 'Заказ будет удалён без возможности восстановления.'}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={deleting}>Отмена</AlertDialogCancel>
        <AlertDialogAction
          disabled={deleting}
          onClick={event => {
            event.preventDefault();
            onConfirm();
          }}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {deleting ? 'Удаление...' : 'Удалить'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);


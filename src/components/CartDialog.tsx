"use client";

import { useMemo, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "@/lib/router";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { MemoizedCartItem as CartItem } from "@/components/CartItem";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart, CART_QUERY_KEY } from "@/hooks/useCart";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatedList } from "@/components/animations";

interface CartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Modal = ({
  open,
  onClose,
  children,
  labelledBy,
  describedBy,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy: string;
  describedBy?: string;
}) => {
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-hidden rounded-xl bg-background shadow-2xl border border-border">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export const CartDialog = ({ open, onOpenChange }: CartDialogProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useCart(open);

  const cartItems = useMemo(() => cart?.items ?? [], [cart?.items]);
  const totalAmount = useMemo(() => cart?.total_amount ?? 0, [cart?.total_amount]);

  const handleUpdateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        const updatedCart = await api.updateCartItem({
          item_id: itemId,
          quantity,
        });
        queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      } catch {
        toast.error("Ошибка при обновлении количества");
      }
    },
    [queryClient]
  );

  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      try {
        const updatedCart = await api.removeFromCart({
          item_id: itemId,
        });
        queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      } catch {
        toast.error("Ошибка при удалении товара");
      }
    },
    [queryClient]
  );

  const handleCheckout = useCallback(() => {
    onOpenChange(false);
    navigate("/checkout");
  }, [navigate, onOpenChange]);

  const contentId = "cart-dialog-content";
  const titleId = "cart-dialog-title";
  const emptyId = "empty-cart-description";

  if (isLoading) {
    return (
      <Modal open={open} onClose={() => onOpenChange(false)} labelledBy={titleId}>
        <div className="flex flex-col gap-4 p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              Корзина
            </h2>
            <span className="sr-only">Загрузка корзины</span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </Modal>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Modal open={open} onClose={() => onOpenChange(false)} labelledBy={titleId} describedBy={emptyId}>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              Корзина
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <ShoppingCart className="h-14 w-14 text-muted-foreground mb-4" />
            <p className="text-base text-foreground font-medium mb-1">Корзина пуста</p>
            <p id={emptyId} className="text-sm text-muted-foreground mb-5">
              Добавьте товары из каталога
            </p>
            <Button onClick={() => onOpenChange(false)}>Продолжить покупки</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} labelledBy={titleId} describedBy={contentId}>
      <div className="flex flex-col h-full max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 id={titleId} className="text-lg sm:text-xl font-semibold text-foreground">
            Корзина
          </h2>
        </div>

        <div id={contentId} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <AnimatedList className="space-y-2 sm:space-y-3">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 14, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  layout
                >
                  <CartItem item={item} onUpdateQuantity={handleUpdateQuantity} onRemove={handleRemoveItem} />
                </motion.div>
              ))}
            </AnimatePresence>
          </AnimatedList>
        </div>

        <div className="border-t bg-card px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base text-muted-foreground">Итого:</span>
            <span className="font-bold text-foreground text-xl sm:text-2xl">{totalAmount} ₸</span>
          </div>
          <Button onClick={handleCheckout} className="w-full" size="lg">
            Оформить заказ
          </Button>
        </div>
      </div>
    </Modal>
  );
};

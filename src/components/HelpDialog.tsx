 "use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "@/components/icons";

interface HelpDialogProps {
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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-background shadow-2xl border border-border">
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

export const HelpDialog = ({ open, onOpenChange }: HelpDialogProps) => {
  const handleClose = () => onOpenChange(false);

  const titleId = "help-dialog-title";
  const descId = "help-dialog-description";

  return (
    <Modal open={open} onClose={handleClose} labelledBy={titleId} describedBy={descId}>
      <div className="flex flex-col h-full max-h-[90vh]">
        <div className="px-5 py-4 border-b">
          <h2 id={titleId} className="text-lg sm:text-xl font-semibold text-foreground">
            Помощь
          </h2>
          <p id={descId} className="text-sm text-muted-foreground mt-1">
            Краткая инструкция по работе с магазином
          </p>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 px-5 py-4 pr-4" style={{ scrollbarWidth: "thin" }}>
          <section>
            <h3 className="text-sm font-semibold text-foreground">Как сделать заказ</h3>
            <ol className="mt-2 text-sm text-muted-foreground space-y-2 list-decimal pl-5">
              <li>Выберите товары из каталога и добавьте их в корзину</li>
              <li>Откройте корзину (иконка в правом верхнем углу) и проверьте состав заказа</li>
              <li>Нажмите «Оформить заказ»</li>
              <li>Заполните контактные данные: имя, телефон и адрес доставки</li>
              <li>При необходимости укажите комментарий к заказу</li>
              <li>Оплатите заказ картой или переводом</li>
              <li>Прикрепите чек об оплате (фото или PDF)</li>
              <li>Нажмите «Подтвердить заказ»</li>
            </ol>
            <p className="mt-2 text-sm text-muted-foreground">
              После оформления заказ отправляется на подтверждение администратору. Вы получите уведомление о статусе заказа в Telegram.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground">Корзина</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Все товары сохраняются автоматически — вы можете закрыть приложение и вернуться позже. Ваша корзина будет ждать вас.
            </p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc pl-4">
              <li>Измените количество товара прямо в корзине</li>
              <li>Выберите вариант товара (если доступны разные вкусы или размеры)</li>
              <li>Удалите ненужные товары кнопкой удаления</li>
              <li>Корзина очищается автоматически после успешного оформления заказа</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground">Оплата и чек</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Мы принимаем оплату банковской картой или переводом. После оплаты обязательно прикрепите чек — это ускорит подтверждение заказа.
            </p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc pl-4">
              <li>
                <strong>Форматы:</strong> JPG, PNG, PDF, WEBP, HEIC (до 10 МБ)
              </li>
              <li>
                <strong>Как прикрепить:</strong> Нажмите «Прикрепить чек» и выберите файл из галереи
              </li>
              <li>
                <strong>Если не загружается:</strong> Проверьте размер файла и формат, попробуйте сжать изображение
              </li>
              <li>
                <strong>Важно:</strong> Чек должен быть читаемым — убедитесь, что все данные видны
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground">Доставка</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Мы доставляем заказы в течение 2 часов после подтверждения. Доступны самовывоз и доставка курьером.
            </p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc pl-4">
              <li>Укажите точный адрес доставки при оформлении заказа</li>
              <li>Если нужна срочная доставка — укажите это в комментарии</li>
              <li>Стоимость доставки рассчитывается индивидуально</li>
              <li>Мы свяжемся с вами для уточнения деталей после подтверждения заказа</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground">Статусы заказа</h3>
            <div className="mt-2 space-y-3">
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">✅ Принят</p>
                <p className="text-muted-foreground">
                  Заказ принят в работу и будет доставлен в течение 2 часов. Мы начнём готовить ваш заказ и свяжемся с вами для уточнения деталей доставки.
                </p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">❌ Отказано</p>
                <p className="text-muted-foreground">
                  Заказ не может быть выполнен. Вы получите уведомление с указанием причины отказа. Товары из такого заказа не списываются со склада.
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Все уведомления о статусе заказа приходят в Telegram. Следите за сообщениями от бота.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground">Если что-то пошло не так</h3>
            <ul className="mt-2 text-sm text-muted-foreground space-y-2 list-disc pl-4">
              <li>
                <strong>Чек не загружается:</strong> Проверьте размер (макс. 10 МБ) и формат файла. Попробуйте сжать изображение или конвертировать в другой формат.
              </li>
              <li>
                <strong>Заказ не оформляется:</strong> Проверьте, что все обязательные поля заполнены (имя, телефон, адрес) и чек прикреплён.
              </li>
              <li>
                <strong>Магазин закрыт:</strong> Если видите сообщение о режиме сна, магазин временно не принимает заказы. Попробуйте позже.
              </li>
              <li>
                <strong>Товар исчез из корзины:</strong> Возможно, товар закончился на складе. Проверьте каталог — если товар снова доступен, добавьте его заново.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground">Если мини‑приложение закрылось</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Не переживайте — все данные сохраняются автоматически. Просто откройте мини‑приложение снова из раздела «Сервисные боты» в Telegram.
            </p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc pl-4">
              <li>Корзина сохраняется между сессиями</li>
              <li>Не нужно обновлять страницу вручную — данные синхронизируются автоматически</li>
              <li>Для возврата назад используйте стрелку в верхнем меню</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground">Нужна помощь?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Напишите нам в ответ на любое уведомление от бота или через кнопку «Ответить» в чате. Мы видим ваш заказ и быстро поможем с любыми вопросами.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Мы поможем с оплатой, доставкой, изменением заказа или решением любых проблем.
            </p>
          </section>
        </div>

        <div className="flex justify-end px-5 py-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );

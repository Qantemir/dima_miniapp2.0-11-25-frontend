'use client';

 'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HelpDialog = ({ open, onOpenChange }: HelpDialogProps) => {
  console.log('HelpDialog rendered, open:', open);
  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Помощь</DialogTitle>
          <DialogDescription>
            Краткая инструкция по работе с магазином
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1" style={{ scrollbarWidth: 'thin' }}>
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
              <li><strong>Форматы:</strong> JPG, PNG, PDF, WEBP, HEIC (до 10 МБ)</li>
              <li><strong>Как прикрепить:</strong> Нажмите «Прикрепить чек» и выберите файл из галереи</li>
              <li><strong>Если не загружается:</strong> Проверьте размер файла и формат, попробуйте сжать изображение</li>
              <li><strong>Важно:</strong> Чек должен быть читаемым — убедитесь, что все данные видны</li>
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
              <li><strong>Чек не загружается:</strong> Проверьте размер (макс. 10 МБ) и формат файла. Попробуйте сжать изображение или конвертировать в другой формат.</li>
              <li><strong>Заказ не оформляется:</strong> Проверьте, что все обязательные поля заполнены (имя, телефон, адрес) и чек прикреплён.</li>
              <li><strong>Магазин закрыт:</strong> Если видите сообщение о режиме сна, магазин временно не принимает заказы. Попробуйте позже.</li>
              <li><strong>Товар исчез из корзины:</strong> Возможно, товар закончился на складе. Проверьте каталог — если товар снова доступен, добавьте его заново.</li>
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

        <div className="flex justify-end pt-4 border-t mt-4">
          <Button variant="outline" onClick={handleClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


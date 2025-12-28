'use client';

import { AdminPageLayout } from '@/components/AdminPageLayout';
import { Seo } from '@/components/Seo';
import { LifeBuoy } from '@/components/icons';
import { useAdminGuard } from '@/hooks/useAdminGuard';

export const AdminHelpPage = () => {
  const isAuthorized = useAdminGuard('/');

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <Seo 
        title="Админ: Помощь" 
        description="Инструкции по управлению каталогом, заказами и режимом сна." 
        path="/admin/help" 
        noIndex={true} 
      />
      <AdminPageLayout
        title="Помощь"
        description="Краткая инструкция по работе с админ-панелью"
        icon={LifeBuoy}
        contentClassName="space-y-6 max-w-3xl"
        contentLabel="Инструкции для администраторов"
      >
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-foreground">Работа с заказами</h3>
            <ol className="mt-2 text-sm text-muted-foreground space-y-2 list-decimal pl-5">
              <li>Все новые заказы приходят в Telegram с фото чека и кнопками для быстрого принятия или отказа</li>
              <li>Откройте заказ в админ-панели для просмотра всех деталей и прикреплённого чека об оплате</li>
              <li>Проверьте чек и данные клиента перед принятием заказа</li>
              <li>Нажмите «✅ Принят» в Telegram или выберите статус в админ-панели</li>
              <li>После принятия заказа свяжитесь с клиентом для уточнения времени доставки</li>
              <li>Используйте фильтры по статусу для быстрого поиска нужных заказов</li>
            </ol>
            <p className="mt-2 text-sm text-muted-foreground">
              В уведомлении о новом заказе в Telegram есть кнопка «✅ Принят» — нажмите её для быстрого принятия заказа без открытия админ-панели. 
              Для отказа используйте кнопку «❌ Отказано» или откройте заказ в админ-панели для указания причины.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground">Статусы заказов</h3>
            <div className="mt-2 space-y-3">
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">✅ Принят</p>
                <p className="text-muted-foreground">
                  После проверки оплаты и чека переключите заказ в «Принят». Клиент получит уведомление, что заказ принят и будет доставлен в течение 2 часов. Начните готовить заказ и свяжитесь с клиентом для уточнения деталей доставки.
                </p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">❌ Отказано</p>
                <p className="text-muted-foreground">
                  Если заказ не может быть выполнен, выберите «Отказано» и обязательно укажите причину отказа (например: "Товар закончился", "Неверные данные оплаты"). Система автоматически вернет товары на склад, а клиент получит уведомление с указанной причиной.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground">Управление каталогом</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Управляйте товарами, категориями и остатками на складе. Добавляйте варианты товаров (вкусы, размеры) и контролируйте их количество.
            </p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc pl-4">
              <li><strong>Варианты:</strong> Для товаров с разными вкусами/размерами создайте варианты с отдельными остатками</li>
              <li><strong>Остатки:</strong> Система автоматически списывает товары при оформлении заказа</li>
              <li><strong>Изображения:</strong> Загружайте качественные фото товаров — они влияют на конверсию</li>
              <li><strong>Категории:</strong> Организуйте товары по категориям для удобной навигации клиентов</li>
              <li><strong>Цены:</strong> Изменения цен применяются сразу — клиенты увидят новые цены при следующем обновлении</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground">Режим сна</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Включайте режим сна, когда нет возможности принимать заказы (конец рабочего дня, технические работы, выходной). 
              Клиенты увидят блокирующий экран с вашим сообщением вместо каталога.
            </p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc pl-4">
              <li><strong>Сообщение:</strong> Укажите причину и время возвращения (например: "Вернёмся завтра в 10:00")</li>
              <li><strong>Обновление:</strong> Текст можно менять на ходу — изменения появятся у всех клиентов через несколько секунд</li>
              <li><strong>Восстановление:</strong> Просто отключите сон — корзины и незавершённые заказы сохраняются</li>
              <li><strong>Тестирование:</strong> Для проверки интерфейса клиента временно выключите сон, затем включите снова</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground">Рассылка клиентам</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Отправляйте массовые сообщения всем клиентам или выбранной группе. Сообщайте об акциях, изменениях в работе или важных новостях.
            </p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc pl-4">
              <li><strong>Ссылки:</strong> Добавьте ссылку на чат поддержки или сайт — клиенты смогут перейти по ней</li>
              <li><strong>Частота:</strong> Не дублируйте сообщения чаще раза в несколько минут, чтобы избежать блокировки Telegram</li>
              <li><strong>Статистика:</strong> После рассылки вы увидите количество отправленных и неудачных сообщений</li>
              <li><strong>Недоступные пользователи:</strong> Автоматически удаляются из базы после неудачной отправки</li>
              <li><strong>Формат:</strong> Текст отправляется «как есть» — Markdown не поддерживается</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-foreground">Если что-то пошло не так</h3>
            <ul className="mt-2 text-sm text-muted-foreground space-y-2 list-disc pl-4">
              <li><strong>Клиент не видит режим сна:</strong> Нажмите «Сохранить» в настройках сна и дождитесь подтверждения «статус обновлён». У клиентов всё обновляется автоматически через несколько секунд.</li>
              <li><strong>Чек не загружается:</strong> Убедитесь, что файл чека читаемый и не превышает лимит 10 МБ. Если проблема сохраняется, попросите клиента сжать изображение или отправить чек в другом формате (JPG, PNG, PDF).</li>
              <li><strong>Заказ нужно отклонить:</strong> Выберите статус «Отказано» и обязательно укажите причину отказа. Клиент получит уведомление с причиной, а товары автоматически вернутся на склад.</li>
              <li><strong>Рассылка не работает:</strong> Проверьте токен бота в настройках. Недоступные получатели (заблокировавшие бота) автоматически помечаются и исключаются из рассылки.</li>
              <li><strong>Клиент не может ввести данные:</strong> На мобильных устройствах попросите пользователя отключить режим «увеличения шрифта» в Telegram WebView или обновить страницу. Проблема обычно связана с настройками браузера.</li>
              <li><strong>Товары не списываются:</strong> Проверьте, что у товара указаны варианты (вкусы/размеры) и количество на складе. Товары без вариантов списываются автоматически при добавлении в корзину.</li>
            </ul>
          </section>
        </div>
      </AdminPageLayout>
    </>
  );
};

export default AdminHelpPage;

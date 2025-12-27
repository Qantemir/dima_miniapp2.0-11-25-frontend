'use client';

import { useNavigate } from '@/lib/router';
import { AdminPageLayout } from '@/components/AdminPageLayout';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, Package, Boxes, Megaphone, Moon, AlertTriangle } from '@/components/icons';
import { useAdminGuard } from '@/hooks/useAdminGuard';

const QUICK_LINKS = [
  {
    label: 'Список заказов',
    description: 'Просматривайте новые заказы, проверяйте чеки об оплате и обновляйте статусы. Используйте фильтры для быстрого поиска.',
    to: '/admin/orders',
    icon: Package,
  },
  {
    label: 'Каталог и остатки',
    description: 'Управляйте товарами: добавляйте новые, редактируйте цены, описания, изображения и варианты (вкусы/размеры). Контролируйте остатки на складе.',
    to: '/admin/catalog',
    icon: Boxes,
  },
  {
    label: 'Рассылка клиентам',
    description: 'Отправляйте массовые сообщения всем клиентам или выбранной группе. Сообщайте об акциях, изменениях в работе или важных новостях.',
    to: '/admin/broadcast',
    icon: Megaphone,
  },
  {
    label: 'Режим сна',
    description: 'Временно приостановите приём заказов. Укажите причину и время возвращения — клиенты увидят это сообщение вместо каталога.',
    to: '/admin/store',
    icon: Moon,
  },
];

const STATUS_TIPS = [
  {
    title: 'Принят',
    text: 'После проверки оплаты и чека переключите заказ в «Принят». Клиент получит уведомление, что заказ принят и будет доставлен в течение 2 часов. Начните готовить заказ и свяжитесь с клиентом для уточнения деталей доставки.',
  },
  {
    title: 'Отказано',
    text: 'Если заказ не может быть выполнен, выберите «Отказано» и обязательно укажите причину отказа (например: "Товар закончился", "Неверные данные оплаты"). Система автоматически вернет товары на склад, а клиент получит уведомление с указанной причиной.',
  },
];

const TROUBLESHOOTING_STEPS = [
  {
    title: 'Клиент не видит режим сна',
    text: 'Нажмите «Сохранить» в настройках сна и дождитесь подтверждения «статус обновлён». У клиентов всё обновляется автоматически через несколько секунд.',
  },
  {
    title: 'Чек не загружается',
    text: 'Убедитесь, что файл чека читаемый и не превышает лимит 10 МБ. Если проблема сохраняется, попросите клиента сжать изображение или отправить чек в другом формате (JPG, PNG, PDF).',
  },
  {
    title: 'Заказ нужно отклонить',
    text: 'Выберите статус «Отказано» и обязательно укажите причину отказа. Клиент получит уведомление с причиной, а товары автоматически вернутся на склад.',
  },
  {
    title: 'Рассылка не работает',
    text: 'Проверьте токен бота в настройках. Недоступные получатели (заблокировавшие бота) автоматически помечаются и исключаются из рассылки.',
  },
  {
    title: 'Клиент не может ввести данные',
    text: 'На мобильных устройствах попросите пользователя отключить режим «увеличения шрифта» в Telegram WebView или обновить страницу. Проблема обычно связана с настройками браузера.',
  },
  {
    title: 'Товары не списываются',
    text: 'Проверьте, что у товара указаны варианты (вкусы/размеры) и количество на складе. Товары без вариантов списываются автоматически при добавлении в корзину.',
  },
];

export const AdminHelpPage = () => {
  const navigate = useNavigate();
  const isAuthorized = useAdminGuard('/');
  const seoProps = {
    title: 'Админ: Помощь',
    description: 'Инструкции по управлению каталогом, заказами и режимом сна.',
    path: '/admin/help',
    noIndex: true,
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <Seo {...seoProps} />
      <AdminPageLayout
        title="Помощь"
        description="Собрали короткие инструкции, чтобы быстрее работать с заказами и режимом сна."
        icon={LifeBuoy}
        contentClassName="space-y-5"
        contentLabel="Инструкции для администраторов"
      >
        <section aria-label="Быстрые действия">
          <h2 className="text-base font-semibold text-foreground mb-3">Быстрые действия</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {QUICK_LINKS.map(link => {
              const Icon = link.icon;
              return (
                <Card key={link.to} className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className="h-4 w-4 text-primary" />
                      {link.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>{link.description}</p>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(link.to)}>
                      Перейти
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section aria-label="Работа со статусами">
          <h2 className="text-base font-semibold text-foreground mb-3">Как работать со статусами заказов</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {STATUS_TIPS.map(item => (
              <Card key={item.title} className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-3 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Быстрое принятие заказа</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                В уведомлении о новом заказе в Telegram есть кнопка «✅ Принят» — нажмите её для быстрого принятия заказа без открытия админ-панели. 
                Для отказа используйте кнопку «❌ Отказано» или откройте заказ в админ-панели для указания причины.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2" aria-label="Подробные советы">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-primary" />
                Работа с заказами
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Все новые заказы приходят в Telegram с фото чека и кнопками для быстрого принятия или отказа. 
                Откройте заказ в админ-панели для просмотра всех деталей.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Проверка чека:</strong> Откройте заказ и просмотрите прикреплённый чек об оплате</li>
                <li><strong>Принятие:</strong> Нажмите «✅ Принят» в Telegram или выберите статус в админ-панели</li>
                <li><strong>Отказ:</strong> Выберите «❌ Отказано» и обязательно укажите причину — клиент получит её в уведомлении</li>
                <li><strong>Доставка:</strong> После принятия заказа свяжитесь с клиентом для уточнения времени доставки</li>
                <li><strong>Фильтры:</strong> Используйте фильтры по статусу для быстрого поиска нужных заказов</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Boxes className="h-4 w-4 text-primary" />
                Управление каталогом
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Управляйте товарами, категориями и остатками на складе. Добавляйте варианты товаров (вкусы, размеры) 
                и контролируйте их количество.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Варианты:</strong> Для товаров с разными вкусами/размерами создайте варианты с отдельными остатками</li>
                <li><strong>Остатки:</strong> Система автоматически списывает товары при оформлении заказа</li>
                <li><strong>Изображения:</strong> Загружайте качественные фото товаров — они влияют на конверсию</li>
                <li><strong>Категории:</strong> Организуйте товары по категориям для удобной навигации клиентов</li>
                <li><strong>Цены:</strong> Изменения цен применяются сразу — клиенты увидят новые цены при следующем обновлении</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Moon className="h-4 w-4 text-primary" />
                Режим сна
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Включайте режим сна, когда нет возможности принимать заказы (конец рабочего дня, технические работы, выходной). 
                Клиенты увидят блокирующий экран с вашим сообщением вместо каталога.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Сообщение:</strong> Укажите причину и время возвращения (например: "Вернёмся завтра в 10:00")</li>
                <li><strong>Обновление:</strong> Текст можно менять на ходу — изменения появятся у всех клиентов через несколько секунд</li>
                <li><strong>Восстановление:</strong> Просто отключите сон — корзины и незавершённые заказы сохраняются</li>
                <li><strong>Тестирование:</strong> Для проверки интерфейса клиента временно выключите сон, затем включите снова</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone className="h-4 w-4 text-primary" />
                Рассылка и коммуникации
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Рассылка отправляется партиями для оптимизации скорости. Система автоматически исключает пользователей, 
                которые заблокировали бота или запретили сообщения. Текст отправляется «как есть» — Markdown не поддерживается.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Ссылки:</strong> Добавьте ссылку на чат поддержки или сайт — клиенты смогут перейти по ней</li>
                <li><strong>Частота:</strong> Не дублируйте сообщения чаще раза в несколько минут, чтобы избежать блокировки Telegram</li>
                <li><strong>Статистика:</strong> После рассылки вы увидите количество отправленных и неудачных сообщений</li>
                <li><strong>Недоступные пользователи:</strong> Автоматически удаляются из базы после неудачной отправки</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section aria-label="Диагностика ошибок">
          <h2 className="text-base font-semibold text-foreground mb-3">Если что-то пошло не так</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {TROUBLESHOOTING_STEPS.map((step, index) => (
              <Card key={index} className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </AdminPageLayout>
    </>
  );
};

export default AdminHelpPage;

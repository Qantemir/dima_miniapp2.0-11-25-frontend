'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from '@/lib/router';
import { ShoppingCart, CheckCircle2, Package, HelpCircle, ShieldCheck } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { MemoizedProductCard as ProductCard } from '@/components/ProductCard';
import { CartDialog } from '@/components/CartDialog';
import { api, getProductImageUrl } from '@/lib/api';
import { getUserId, isAdmin } from '@/lib/telegram';
import { toast } from '@/lib/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAdminView } from '@/contexts/AdminViewContext';
import { ADMIN_IDS, type Cart } from '@/types/api';
import { Seo } from '@/components/Seo';
import { useStoreStatus } from '@/contexts/StoreStatusContext';
import { useCatalog } from '@/hooks/useCatalog';
import { useCart, CART_QUERY_KEY } from '@/hooks/useCart';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AnimatedList, AnimatedItem } from '@/components/animations';
import { motion } from 'framer-motion';
import { useFixedHeaderOffset } from '@/hooks/useFixedHeaderOffset';

export const CatalogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const { status: storeStatus, loading: storeStatusLoading } = useStoreStatus();
  const navigate = useNavigate();
  const { forceClientView, setForceClientView } = useAdminView();
  const userId = getUserId();
  // Мемоизация проверки админа для предотвращения лишних вычислений
  const isUserAdmin = useMemo(() => userId ? isAdmin(userId, ADMIN_IDS) : false, [userId]);
  const queryClient = useQueryClient();
  const {
    data: catalog,
    isLoading: catalogLoading,
    error: catalogError,
  } = useCatalog();
  // Оптимизированная мемоизация для предотвращения лишних ререндеров
  const categories = useMemo(() => catalog?.categories ?? [], [catalog?.categories]);
  const catalogProducts = useMemo(() => catalog?.products ?? [], [catalog?.products]);
  const { data: cartData } = useCart(Boolean(userId));
  const cartItemsCount = useMemo(() => cartData?.items.length ?? 0, [cartData?.items.length]);
  const { headerRef, headerHeight } = useFixedHeaderOffset(96);
  // Константа вынесена для оптимизации
  const headerTopOffset = useMemo(() => 'calc(env(safe-area-inset-top, 0px) + var(--tg-header-height, 0px))', []);

  // Оптимизированная генерация JSON-LD (только первые 10 товаров для скорости)
  const catalogJsonLd = useMemo(() => {
    if (!catalogProducts.length) return undefined;
    const products = catalogProducts.slice(0, 10); // Уменьшено с 20 до 10 для скорости
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Каталог товаров",
      itemListElement: products.map((product, index) => ({
        "@type": "Product",
        name: product.name,
        description: product.description?.substring(0, 150), // Ограничиваем описание
        image: product.images?.[0] ? getProductImageUrl(product.images[0]) : undefined,
        offers: {
          "@type": "Offer",
          priceCurrency: "KZT",
          price: product.price ?? 0,
          availability: product.available
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
        position: index + 1,
      })),
    };
  }, [catalogProducts]);

  useEffect(() => {
    if (catalogError) {
      const errorMessage = catalogError instanceof Error ? catalogError.message : 'Ошибка загрузки каталога';
      toast.error(`Ошибка загрузки каталога: ${errorMessage}`);
    }
  }, [catalogError]);

  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Мемоизация обработчика для предотвращения лишних ререндеров
  const handleAddToCart = useCallback(async (
    productId: string,
    variantId: string | undefined,
    quantity: number
  ) => {
    // Защита от множественных кликов
    const requestKey = `${productId}-${variantId}`;
    if (addingToCart === requestKey) {
      return; // Уже выполняется запрос
    }

    if (storeStatus?.is_sleep_mode) {
      toast.warning(storeStatus.sleep_message || 'Магазин временно не принимает заказы');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      toast.error('Ошибка: не удалось определить пользователя');
      return;
    }

    setAddingToCart(requestKey);
    try {
      const updatedCart = await api.addToCart({
        product_id: productId,
        variant_id: variantId,
        quantity,
      });
      
      // Обновляем корзину с реальными данными - этого достаточно
      queryClient.setQueryData(CART_QUERY_KEY, updatedCart);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
    } catch (error) {
      // Обновляем корзину при ошибке, чтобы показать актуальное состояние
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при добавлении в корзину';
      toast.error(errorMessage);
    } finally {
      setAddingToCart(null);
    }
  }, [storeStatus?.is_sleep_mode, storeStatus?.sleep_message, queryClient, addingToCart]);

  const handleHelp = useCallback(() => setHelpDialogOpen(true), []);
  
  const handleOpenCart = useCallback(() => setCartDialogOpen(true), []);
  const handleSelectAllCategories = useCallback(() => setSelectedCategory(null), []);
  const handleSelectCategory = useCallback((categoryId: string) => setSelectedCategory(categoryId), []);

  // Оптимизированная фильтрация продуктов (используем Map для O(1) поиска)
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return catalogProducts;
    // Используем простой filter - достаточно быстро для небольших списков
    return catalogProducts.filter(p => p.category_id === selectedCategory);
  }, [catalogProducts, selectedCategory]);
  
  // Оптимизированная мемоизация isAdding (без split если нет значения)
  const isAddingMap = useMemo(() => {
    if (!addingToCart) return new Map<string, boolean>();
    const map = new Map<string, boolean>();
    const productId = addingToCart.split('-', 1)[0]; // Ограничиваем split до 1 элемента
    map.set(productId, true);
    return map;
  }, [addingToCart]);

  if (catalogLoading || !catalog) {
    return (
      <>
        <Seo
          title="Каталог товаров"
          description="Просматривайте категории и товары Mini Shop прямо внутри Telegram."
          path="/"
        />
        <main className="min-h-screen bg-background p-4 space-y-4" role="main" aria-busy>
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-2 overflow-x-auto pb-2" aria-hidden>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-10 w-24 flex-shrink-0" />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Каталог товаров"
        description="Выбирайте товары по категориям и добавляйте их в корзину в Mini Shop."
        path="/"
        jsonLd={catalogJsonLd}
      />
      <header
        ref={headerRef}
        className="fixed inset-x-0 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3 sm:px-6 sm:py-4 shadow-sm"
        style={{
          top: headerTopOffset,
          zIndex: 10,
        }}
        role="banner"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-shrink">
            <Package className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" aria-hidden="true" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">Магазин</h1>
          </div>

          <nav className="flex items-center gap-2 flex-shrink-0" aria-label="Навигация по магазину">
            {isUserAdmin && forceClientView && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setForceClientView(false);
                  navigate('/admin');
                }}
                className="h-10 px-3 sm:px-4 gap-2 rounded-lg"
              >
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline text-sm font-medium">Админ-режим</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleHelp}
              className="h-10 px-3 sm:px-4 rounded-lg"
            >
              <HelpCircle className="h-4 w-4 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline text-sm font-medium">Помощь</span>
            </Button>

            <div className="relative">
              <Button
                variant="default"
                size="sm"
                onClick={handleOpenCart}
                className="relative h-10 px-3 sm:px-4 rounded-lg shadow-sm"
              >
                <ShoppingCart className="h-4 w-4 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline text-sm font-medium">Корзина</span>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 sm:relative sm:top-0 sm:right-0 sm:ml-2 bg-primary-foreground text-primary text-[10px] sm:text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:px-2 sm:w-auto flex items-center justify-center shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
              {addSuccess && (
                <span className="absolute -right-1 -top-8 sm:-top-7 flex items-center gap-1 text-[10px] sm:text-xs text-primary bg-card/95 px-2 py-1 rounded-full shadow whitespace-nowrap">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Добавлено</span>
                </span>
              )}
            </div>
          </nav>
        </div>
      </header>
      <main
        className="min-h-screen bg-background pb-20"
        role="main"
        style={{
          paddingTop: `calc(${headerHeight}px + env(safe-area-inset-top, 0px) + var(--tg-header-height, 0px))`,
        }}
      >

      {storeStatus?.is_sleep_mode && (
        <section className="p-4" aria-label="Статус магазина">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive">Магазин временно не работает</CardTitle>
              <CardDescription className="text-destructive/80">
                {storeStatus.sleep_message || 'Мы временно не принимаем заказы. Возвращайтесь позже!'}
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      )}

      {categories.length > 0 && (
        <motion.section
          aria-label="Категории"
          className="px-4 py-4 sm:px-6 sm:py-5 border-b border-border bg-card"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-hide">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={handleSelectAllCategories}
                className="flex-shrink-0 h-10 px-5 text-sm font-medium"
              >
                Все
              </Button>
            </motion.div>
            {categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => handleSelectCategory(category.id)}
                  className="flex-shrink-0 h-10 px-5 text-sm font-medium whitespace-nowrap"
                >
                  {category.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      <section className="px-4 py-5 sm:px-6 sm:py-6" aria-label="Список товаров">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <Package className="h-20 w-20 sm:h-24 sm:w-24 text-muted-foreground mx-auto mb-4" />
            <p className="text-base sm:text-lg text-muted-foreground font-medium">Товары не найдены</p>
            <p className="text-sm text-muted-foreground mt-2">Попробуйте выбрать другую категорию</p>
          </div>
        ) : (
          <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredProducts.map((product) => (
              <AnimatedItem key={product.id}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  purchasesDisabled={storeStatus?.is_sleep_mode ?? false}
                  isAdding={isAddingMap.get(product.id) ?? false}
                />
              </AnimatedItem>
            ))}
          </AnimatedList>
        )}
      </section>

      <CartDialog
        open={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
      />
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
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
            <Button variant="outline" onClick={() => setHelpDialogOpen(false)}>
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
    </>
  );
};

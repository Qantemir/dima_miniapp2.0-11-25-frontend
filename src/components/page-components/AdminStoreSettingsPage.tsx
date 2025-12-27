'use client';

import { useEffect, useRef, useState } from 'react';
import { Moon } from '@/components/icons';
import { AdminPageLayout } from '@/components/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Seo } from '@/components/Seo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { queryKeys } from '@/lib/react-query';

export const AdminStoreSettingsPage = () => {
  const queryClient = useQueryClient();
  const isAuthorized = useAdminGuard('/');
  
  const {
    data: status,
    isLoading: loading,
  } = useQuery({
    queryKey: queryKeys.storeStatus,
    queryFn: () => api.getStoreStatus(),
    staleTime: 60 * 1000, // 1 минута (увеличено с 10 секунд)
    gcTime: 10 * 60 * 1000, // 10 минут кэш
    enabled: isAuthorized,
  });
  const [saving, setSaving] = useState(false);
  const [sleepEnabled, setSleepEnabled] = useState(false);
  const [message, setMessage] = useState('');

  const initializedRef = useRef(false);

  // Инициализируем только один раз при первой загрузке
  useEffect(() => {
    if (!status || initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    setSleepEnabled(status.is_sleep_mode);
    setMessage(status.sleep_message || '');
  }, [status]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        sleep: sleepEnabled,
        message: message || undefined,
      };
      const updated = await api.setStoreSleepMode(payload);
      setSleepEnabled(updated.is_sleep_mode);
      setMessage(updated.sleep_message || '');
      queryClient.invalidateQueries({ queryKey: queryKeys.storeStatus });
      toast.success('Статус магазина обновлён');
    } catch (error) {
      toast.error('Не удалось обновить статус магазина');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Seo title="Админ: Режим сна" description="Управляйте статусом магазина и сообщением для клиентов." path="/admin/store" noIndex />
      {!isAuthorized ? null : (
      <AdminPageLayout
        title="Режим сна"
        description="Включайте и отключайте приём заказов"
        icon={Moon}
        contentClassName="space-y-4"
        contentLabel="Настройки режима сна"
      >
        {loading ? (
          <section aria-busy aria-label="Загрузка статуса магазина">
            <Skeleton className="h-48 w-full" />
          </section>
        ) : (
          <>
            <section aria-label="Управление режимом сна">
              <Card className="border border-border bg-card p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Label className="text-base font-semibold block mb-1">Магазин в режиме сна</Label>
                    <p className="text-sm text-muted-foreground">
                      Клиенты увидят сообщение и не смогут оформить заказ
                    </p>
                  </div>
                  <div className="flex-shrink-0 pt-1">
                    <Switch
                      checked={sleepEnabled}
                      onCheckedChange={setSleepEnabled}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sleep-message">Сообщение для клиентов</Label>
                  <Textarea
                    id="sleep-message"
                    rows={4}
                    value={message}
                    onChange={event => setMessage(event.target.value)}
                    onInput={event => setMessage((event.target as HTMLTextAreaElement).value)}
                    placeholder="Например: Мы временно не принимаем заказы. Вернёмся завтра!"
                    disabled={saving}
                    className="resize-none bg-background text-foreground placeholder:text-muted-foreground"
                    autoCapitalize="sentences"
                    autoCorrect="on"
                    spellCheck
                    inputMode="text"
                  />
                  <p className="text-xs text-muted-foreground">
                    Сообщение увидят клиенты на главной странице. Если оставить пустым — будет показан текст по умолчанию. Вы можете ввести сообщение заранее, перед включением режима сна.
                  </p>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Сохранение...' : sleepEnabled ? 'Сохранить изменения' : 'Сохранить настройки'}
                </Button>
              </Card>
            </section>

            {status && (
              <section aria-label="Текущий статус магазина">
                <Card>
                  <CardHeader>
                    <CardTitle>Текущий статус</CardTitle>
                    <CardDescription>
                      {status.is_sleep_mode
                        ? `Магазин закрыт. Сообщение: ${status.sleep_message || 'используется текст по умолчанию'}.`
                        : (
                        'Магазин принимает заказы.'
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </section>
            )}
          </>
        )}
      </AdminPageLayout>
      )}
    </>
  );
};

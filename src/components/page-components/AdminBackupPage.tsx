'use client';

import { useState, useRef } from 'react';
import { Database, Download, Upload } from '@/components/icons';
import { AdminPageLayout } from '@/components/AdminPageLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { toast } from '@/lib/toast';
import { Seo } from '@/components/Seo';
import { useQuery } from '@tanstack/react-query';
import { useBackupGuard } from '@/hooks/useBackupGuard';
import { queryKeys } from '@/lib/react-query';
import type { BackupInfo } from '@/types/api';

export const AdminBackupPage = () => {
  const isAuthorized = useBackupGuard('/');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [clearExisting, setClearExisting] = useState(false);
  const [includeCarts, setIncludeCarts] = useState(false);
  const [includeOrders, setIncludeOrders] = useState(false);

  const {
    data: backupInfo,
    isLoading: loading,
    refetch: refetchInfo,
  } = useQuery({
    queryKey: ['backup-info'],
    queryFn: () => api.getBackupInfo(),
    staleTime: 30 * 1000,
    enabled: isAuthorized,
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const { blob, filename } = await api.exportBackup({
        include_carts: includeCarts,
        include_orders: includeOrders,
      });
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Небольшая задержка перед удалением элемента
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Бэкап успешно экспортирован и скачан');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось экспортировать бэкап');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем расширение файла
    if (!file.name.endsWith('.json') && !file.name.endsWith('.json.gz') && !file.name.endsWith('.gz')) {
      toast.error('Файл должен быть в формате JSON или JSON.GZ');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setImporting(true);
    try {
      const result = await api.importBackup(file, clearExisting);
      
      toast.success(
        `Бэкап успешно импортирован. Импортировано документов: ${result.total_imported}`
      );
      
      // Обновляем информацию о коллекциях
      await refetchInfo();
      
      // Очищаем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось импортировать бэкап');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Seo 
        title="Админ: Бэкап" 
        description="Экспорт и импорт базы данных." 
        path="/admin/backup" 
        noIndex 
      />
      {!isAuthorized ? null : (
        <AdminPageLayout
          title="Бэкап"
          description="Экспорт и импорт базы данных"
          icon={Database}
          contentClassName="space-y-4"
          contentLabel="Управление бэкапами"
        >
          {loading ? (
            <section aria-busy aria-label="Загрузка информации о базе данных">
              <Skeleton className="h-48 w-full" />
            </section>
          ) : (
            <>
              {backupInfo && (
                <section aria-label="Информация о базе данных">
                  <Card className="border border-border bg-card p-4">
                    <h2 className="text-lg font-semibold mb-3">Коллекции базы данных</h2>
                    <div className="space-y-2">
                      {Object.entries(backupInfo.collections).map(([name, count]) => (
                        <div key={name} className="flex items-center justify-between text-sm">
                          <span className="text-foreground font-medium">{name}</span>
                          <span className="text-muted-foreground">
                            {typeof count === 'number' ? count.toLocaleString() : count} документов
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>Всего коллекций</span>
                          <span>{backupInfo.total_collections}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </section>
              )}

              <section aria-label="Экспорт базы данных">
                <Card className="border border-border bg-card p-4 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Экспорт базы данных</h2>
                    <p className="text-sm text-muted-foreground">
                      Скачайте резервную копию базы данных в формате JSON.GZ
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Label htmlFor="include-carts" className="text-base font-medium">
                          Включить корзины
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Экспортировать данные корзин пользователей
                        </p>
                      </div>
                      <Switch
                        id="include-carts"
                        checked={includeCarts}
                        onCheckedChange={setIncludeCarts}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Label htmlFor="include-orders" className="text-base font-medium">
                          Включить заказы
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Экспортировать данные заказов
                        </p>
                      </div>
                      <Switch
                        id="include-orders"
                        checked={includeOrders}
                        onCheckedChange={setIncludeOrders}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleExport} 
                    disabled={exporting}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {exporting ? 'Экспорт...' : 'Экспортировать бэкап'}
                  </Button>
                </Card>
              </section>

              <section aria-label="Импорт базы данных">
                <Card className="border border-border bg-card p-4 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Импорт базы данных</h2>
                    <p className="text-sm text-muted-foreground">
                      Восстановите базу данных из файла бэкапа (JSON или JSON.GZ)
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Label htmlFor="clear-existing" className="text-base font-medium">
                        Очистить существующие данные
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Удалить все данные перед импортом (опасно!)
                      </p>
                    </div>
                    <Switch
                      id="clear-existing"
                      checked={clearExisting}
                      onCheckedChange={setClearExisting}
                    />
                  </div>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.json.gz,.gz"
                      onChange={handleImport}
                      disabled={importing}
                      className="hidden"
                      id="backup-file-input"
                    />
                    <Label htmlFor="backup-file-input" className="cursor-pointer">
                      <Button
                        asChild
                        variant="outline"
                        disabled={importing}
                        className="w-full"
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {importing ? 'Импорт...' : 'Выбрать файл бэкапа'}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </Card>
              </section>
            </>
          )}
        </AdminPageLayout>
      )}
    </>
  );
};


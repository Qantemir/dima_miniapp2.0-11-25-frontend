'use client';

import { AdminPageLayout } from '@/components/AdminPageLayout';
import { Seo } from '@/components/Seo';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard } from '@/components/icons';
import { useAdminGuard } from '@/hooks/useAdminGuard';

export const AdminPaymentPage = () => {
  const isAuthorized = useAdminGuard('/');

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <Seo title="Админ: Подключение оплаты" description="Функциональность удалена." path="/admin/payments" noIndex />
      <AdminPageLayout
        title="Подключение оплаты"
        description="Функциональность удалена."
        icon={CreditCard}
        contentClassName="space-y-4"
        contentLabel="Настройки онлайн-оплаты"
      >
        <Card className="border border-border bg-card p-4">
          <CardHeader>
            <CardTitle>Функциональность удалена</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Управление ссылкой на оплату больше не доступно. Эта функциональность была удалена из системы.
            </CardDescription>
          </CardHeader>
        </Card>
      </AdminPageLayout>
    </>
  );
};

export default AdminPaymentPage;


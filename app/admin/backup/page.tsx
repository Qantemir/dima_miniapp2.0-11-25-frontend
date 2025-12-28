'use client';

import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const AdminBackupPage = dynamic(() => import('@pages/AdminBackupPage').then(mod => ({ default: mod.AdminBackupPage })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

export default AdminBackupPage;


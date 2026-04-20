'use client';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminBackupPage } from '@/components/pages/admin/AdminBackupPage';

export default function BackupPage() {
  return (
    <AdminAuthGuard>
      <AdminBackupPage />
    </AdminAuthGuard>
  );
}

'use client';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminSettingsPage } from '@/components/pages/admin/AdminSettingsPage';

export default function SettingsPage() {
  return (
    <AdminAuthGuard>
      <AdminSettingsPage />
    </AdminAuthGuard>
  );
}

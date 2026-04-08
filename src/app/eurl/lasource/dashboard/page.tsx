'use client';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminDashboardPage } from '@/components/pages/admin/AdminDashboardPage';

export default function DashboardPage() {
  return (
    <AdminAuthGuard>
      <AdminDashboardPage />
    </AdminAuthGuard>
  );
}

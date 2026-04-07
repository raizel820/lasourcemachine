'use client';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminServicesPage } from '@/components/pages/admin/AdminServicesPage';

export default function ServicesPage() {
  return (
    <AdminAuthGuard>
      <AdminServicesPage />
    </AdminAuthGuard>
  );
}

'use client';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminPartnersPage } from '@/components/pages/admin/AdminPartnersPage';

export default function PartnersPage() {
  return (
    <AdminAuthGuard>
      <AdminPartnersPage />
    </AdminAuthGuard>
  );
}

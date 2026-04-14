'use client';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminLeadsPage } from '@/components/pages/admin/AdminLeadsPage';

export default function LeadsPage() {
  return (
    <AdminAuthGuard>
      <AdminLeadsPage />
    </AdminAuthGuard>
  );
}

'use client';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminProductionLinesPage } from '@/components/pages/admin/AdminProductionLinesPage';

export default function ProductionLinesPage() {
  return (
    <AdminAuthGuard>
      <AdminProductionLinesPage />
    </AdminAuthGuard>
  );
}

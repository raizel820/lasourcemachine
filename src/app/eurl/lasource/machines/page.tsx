'use client';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminMachinesPage } from '@/components/pages/admin/AdminMachinesPage';

export default function MachinesPage() {
  return (
    <AdminAuthGuard>
      <AdminMachinesPage />
    </AdminAuthGuard>
  );
}

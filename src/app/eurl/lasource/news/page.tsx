'use client';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminNewsPage } from '@/components/pages/admin/AdminNewsPage';

export default function NewsPage() {
  return (
    <AdminAuthGuard>
      <AdminNewsPage />
    </AdminAuthGuard>
  );
}

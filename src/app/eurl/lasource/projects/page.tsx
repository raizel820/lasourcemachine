'use client';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminProjectsPage } from '@/components/pages/admin/AdminProjectsPage';

export default function ProjectsPage() {
  return (
    <AdminAuthGuard>
      <AdminProjectsPage />
    </AdminAuthGuard>
  );
}

import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminCategoriesPage } from '@/components/pages/admin/AdminCategoriesPage';

export default function CategoriesRoute() {
  return (
    <AdminAuthGuard>
      <AdminCategoriesPage />
    </AdminAuthGuard>
  );
}

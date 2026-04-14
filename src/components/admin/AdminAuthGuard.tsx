'use client';

import { useAppStore } from '@/lib/store';
import { AdminLayout } from './AdminLayout';
import { AdminLogin } from './AdminLogin';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAppStore();

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

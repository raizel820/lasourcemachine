'use client';

import { useAppStore } from '@/lib/store';
import { AdminSidebar } from './AdminSidebar';
import { AdminLogin } from './AdminLogin';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Shield } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  admin: 'Dashboard',
  'admin-machines': 'Machines',
  'admin-production-lines': 'Production Lines',
  'admin-news': 'News',
  'admin-projects': 'Projects',
  'admin-services': 'Services',
  'admin-partners': 'Partners',
  'admin-leads': 'Leads',
  'admin-settings': 'Settings',
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentPage, isAdmin } = useAppStore();

  if (!isAdmin) {
    return <AdminLogin />;
  }

  const pageTitle = PAGE_TITLES[currentPage] || 'Admin';

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    useAppStore.getState().setCurrentPage('admin');
                  }}
                  className="flex items-center gap-1"
                >
                  <Shield className="h-3.5 w-3.5 text-blue-600" />
                  Admin
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              A
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">Admin</span>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

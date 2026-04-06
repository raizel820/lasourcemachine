'use client';

import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  Factory,
  GitBranch,
  Newspaper,
  Briefcase,
  Wrench,
  Handshake,
  MessageSquare,
  Settings,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { COMPANY } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  page: string;
  isAction?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, page: 'admin' },
  { id: 'machines', label: 'Machines', icon: Factory, page: 'admin-machines' },
  { id: 'production-lines', label: 'Production Lines', icon: GitBranch, page: 'admin-production-lines' },
  { id: 'news', label: 'News', icon: Newspaper, page: 'admin-news' },
  { id: 'projects', label: 'Projects', icon: Briefcase, page: 'admin-projects' },
  { id: 'services', label: 'Services', icon: Wrench, page: 'admin-services' },
  { id: 'partners', label: 'Partners', icon: Handshake, page: 'admin-partners' },
  { id: 'leads', label: 'Leads', icon: MessageSquare, page: 'admin-leads' },
  { id: 'settings', label: 'Settings', icon: Settings, page: 'admin-settings' },
];

export function AdminSidebar() {
  const { currentPage, setCurrentPage, setAdminAuth } = useAppStore();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    setAdminAuth(false, null);
    setCurrentPage('home');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-sidebar-accent/50"
              onClick={() => handleNavigate('admin')}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Factory className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-sm">{COMPANY.name}</span>
                <span className="text-xs text-muted-foreground">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={currentPage === item.page}
                    tooltip={item.label}
                    onClick={() => handleNavigate(item.page)}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Back to Website"
              onClick={() => handleNavigate('home')}
            >
              <ArrowLeft className="size-4" />
              <span>Back to Website</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={handleLogout}
              className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

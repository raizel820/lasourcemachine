'use client';

import { useAppStore } from '@/lib/store';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { HomePage } from '@/components/pages/HomePage';
import { MachinesPage } from '@/components/pages/MachinesPage';
import { MachineDetailPage } from '@/components/pages/MachineDetailPage';
import { ProductionLinesPage } from '@/components/pages/ProductionLinesPage';
import { ProductionLineDetailPage } from '@/components/pages/ProductionLineDetailPage';
import { ServicesPage } from '@/components/pages/ServicesPage';
import { ProjectsPage } from '@/components/pages/ProjectsPage';
import { ProjectDetailPage } from '@/components/pages/ProjectDetailPage';
import { NewsPage } from '@/components/pages/NewsPage';
import { NewsDetailPage } from '@/components/pages/NewsDetailPage';
import { FAQPage } from '@/components/pages/FAQPage';
import { AboutPage } from '@/components/pages/AboutPage';
import { ContactPage } from '@/components/pages/ContactPage';
import { AdminDashboardPage } from '@/components/pages/admin/AdminDashboardPage';
import { AdminMachinesPage } from '@/components/pages/admin/AdminMachinesPage';
import { AdminProductionLinesPage } from '@/components/pages/admin/AdminProductionLinesPage';
import { AdminNewsPage } from '@/components/pages/admin/AdminNewsPage';
import { AdminProjectsPage } from '@/components/pages/admin/AdminProjectsPage';
import { AdminServicesPage } from '@/components/pages/admin/AdminServicesPage';
import { AdminPartnersPage } from '@/components/pages/admin/AdminPartnersPage';
import { AdminLeadsPage } from '@/components/pages/admin/AdminLeadsPage';
import { AdminSettingsPage } from '@/components/pages/admin/AdminSettingsPage';

export default function App() {
  const { currentPage } = useAppStore();

  const isAdminPage = currentPage.startsWith('admin');

  const renderAdminPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminDashboardPage />;
      case 'admin-machines':
        return <AdminMachinesPage />;
      case 'admin-production-lines':
        return <AdminProductionLinesPage />;
      case 'admin-news':
        return <AdminNewsPage />;
      case 'admin-projects':
        return <AdminProjectsPage />;
      case 'admin-services':
        return <AdminServicesPage />;
      case 'admin-partners':
        return <AdminPartnersPage />;
      case 'admin-leads':
        return <AdminLeadsPage />;
      case 'admin-settings':
        return <AdminSettingsPage />;
      default:
        return <AdminDashboardPage />;
    }
  };

  const renderPublicPage = () => {
    switch (currentPage) {
      case 'machines':
        return <MachinesPage />;
      case 'machine-detail':
        return <MachineDetailPage />;
      case 'production-lines':
        return <ProductionLinesPage />;
      case 'production-line-detail':
        return <ProductionLineDetailPage />;
      case 'services':
        return <ServicesPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'project-detail':
        return <ProjectDetailPage />;
      case 'news':
        return <NewsPage />;
      case 'news-detail':
        return <NewsDetailPage />;
      case 'faq':
        return <FAQPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  // Admin pages use their own layout (AdminLayout handles sidebar + login)
  if (isAdminPage) {
    return <AdminLayout>{renderAdminPage()}</AdminLayout>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {renderPublicPage()}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

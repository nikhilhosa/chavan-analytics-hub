import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import Overview from './Overview';
import SalesDashboard from './SalesDashboard';
import ServiceDashboard from './ServiceDashboard';
import AdminDashboard from './AdminDashboard';
import DashboardBuilder from './DashboardBuilder';
import UserManagement from './UserManagement';
import DataUpload from './DataUpload';
import DeploymentCenter from './DeploymentCenter';

const Dashboard: React.FC = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-12 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 px-4">
          <SidebarTrigger />
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </header>

        <div className="flex w-full pt-12">
          <AppSidebar />
          <main className="flex-1 p-6">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="sales" element={<SalesDashboard />} />
              <Route path="service" element={<ServiceDashboard />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="builder" element={<DashboardBuilder />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="data" element={<DataUpload />} />
              <Route path="deploy" element={<DeploymentCenter />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

import React from 'react';
import SfdAdminDashboard from '@/components/admin/SfdAdminDashboard';
import { SfdAdminLayout } from '@/components/sfd/SfdAdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const SfdAdminDashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Chargement...</span>
      </div>
    );
  }

  return (
    <SfdAdminLayout>
      <SfdAdminDashboard />
    </SfdAdminLayout>
  );
};

export default SfdAdminDashboardPage;

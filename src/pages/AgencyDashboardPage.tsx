
import React from 'react';
import { SfdAdminLayout } from '@/components/sfd/SfdAdminLayout';
import { SfdDashboard } from '@/components/sfd/SfdDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const AgencyDashboardPage = () => {
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
      <div className="p-6">
        <SfdDashboard />
      </div>
    </SfdAdminLayout>
  );
};

export default AgencyDashboardPage;


import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { 
  DashboardWidgets, 
  SuperAdminDashboardHeader, 
  DashboardTabs,
  DashboardCharts
} from '@/components/admin/dashboard';
import { useSubsidies } from '@/hooks/useSubsidies';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { ReportGenerator } from '@/components/ReportGenerator';
import { DataExport } from '@/components/DataExport';
import { Button } from '@/components/ui/button';
import { FileText, CreditCard, Building, Users } from 'lucide-react';
import { AdminManagement } from '@/components/admin/AdminManagement';

const SuperAdminDashboard = () => {
  const { subsidies, isLoading: isLoadingSubsidies } = useSubsidies();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const { stats, isLoading: isLoadingStats } = useDashboardStats();
  const navigate = useNavigate();
  
  // Set the active tab based on query parameter
  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'dashboard' });
    }
  }, [searchParams, setSearchParams]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <SuperAdminDashboardHeader />
        
        {/* Quick Actions */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="flex items-center bg-white" 
            onClick={() => navigate('/credit-approval')}
          >
            <CreditCard className="h-4 w-4 mr-2 text-[#0D6A51]" />
            Approbation de Crédit
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center bg-white"
            onClick={() => navigate('/credit-approval?tab=sfd-management')}
          >
            <Building className="h-4 w-4 mr-2 text-[#0D6A51]" />
            Gestion des SFDs
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center bg-white"
            onClick={() => setSearchParams({ tab: 'reports' })}
          >
            <FileText className="h-4 w-4 mr-2 text-[#0D6A51]" />
            Générer des Rapports
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center bg-white"
            onClick={() => setSearchParams({ tab: 'admins' })}
          >
            <Users className="h-4 w-4 mr-2 text-[#0D6A51]" />
            Gestion Administrateurs
          </Button>
        </div>
        
        {/* Dashboard Widgets */}
        {activeTab === 'dashboard' && (
          <DashboardWidgets 
            stats={stats} 
            isLoading={isLoadingStats} 
            subsidies={subsidies} 
            isLoadingSubsidies={isLoadingSubsidies} 
          />
        )}
        
        {/* Charts */}
        {activeTab === 'charts' && (
          <DashboardCharts />
        )}
        
        {/* Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <ReportGenerator />
          </div>
        )}
        
        {/* Data Export */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <DataExport />
          </div>
        )}
        
        {/* Admin Management */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <AdminManagement />
          </div>
        )}
        
        <DashboardTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

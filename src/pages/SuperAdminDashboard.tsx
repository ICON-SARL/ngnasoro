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
import { FileText, Building, Users, Shield, BarChart2 } from 'lucide-react';
import { AdminManagement } from '@/components/admin/AdminManagement';
import { SfdManagement } from '@/components/admin/sfd-management';
import { MerefSfdCommunication } from '@/components/admin/shared/MerefSfdCommunication';
import { AdminNotifications } from '@/components/admin/shared/AdminNotifications';
import { IntegratedDashboard } from '@/components/admin/shared/IntegratedDashboard';
import AuditLogsSummary from '@/components/audit/AuditLogsSummary';
import { SubsidySummary } from '@/components/admin/dashboard/SubsidySummary';
import { PendingSubsidies } from '@/components/admin/dashboard/PendingSubsidies';
import { Footer } from '@/components';
import { FinancialReports } from '@/components/reports/FinancialReports';
import { SfdClientStatsDashboard } from '@/components/admin/meref/SfdClientStatsDashboard';

const SuperAdminDashboard = () => {
  const { subsidies, isLoading: isLoadingSubsidies } = useSubsidies();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const { stats, isLoading: isLoadingStats } = useDashboardStats();
  const navigate = useNavigate();
  
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
      <SuperAdminHeader additionalComponents={<AdminNotifications />} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <SuperAdminDashboardHeader />
        
        <div className="mb-6 flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="flex items-center bg-white border-gray-200 hover:bg-gray-50 hover:text-green-600 text-sm" 
            onClick={() => navigate('/credit-approval')}
          >
            <FileText className="h-4 w-4 mr-2 text-gray-600" />
            Approbation de Crédit
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center bg-white border-gray-200 hover:bg-gray-50 hover:text-green-600 text-sm"
            onClick={() => navigate('/sfd-management')}
          >
            <Building className="h-4 w-4 mr-2 text-gray-600" />
            Gestion des SFDs
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center bg-white border-gray-200 hover:bg-gray-50 hover:text-green-600 text-sm"
            onClick={() => setSearchParams({ tab: 'reports' })}
          >
            <FileText className="h-4 w-4 mr-2 text-gray-600" />
            Générer des Rapports
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center bg-white border-gray-200 hover:bg-gray-50 hover:text-green-600 text-sm"
            onClick={() => setSearchParams({ tab: 'admins' })}
          >
            <Users className="h-4 w-4 mr-2 text-gray-600" />
            Gestion Administrateurs
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center bg-white border-gray-200 hover:bg-gray-50 hover:text-green-600 text-sm"
            onClick={() => navigate('/audit-logs')}
          >
            <Shield className="h-4 w-4 mr-2 text-gray-600" />
            Journal d'Audit
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center bg-white border-gray-200 hover:bg-gray-50 hover:text-green-600 text-sm"
            onClick={() => setSearchParams({ tab: 'client-stats' })}
          >
            <BarChart2 className="h-4 w-4 mr-2 text-gray-600" />
            Statistiques Clients SFD
          </Button>
          
          <MerefSfdCommunication />
        </div>
        
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <SubsidySummary />
                  <PendingSubsidies />
                </div>
                <DashboardWidgets 
                  stats={stats} 
                  isLoading={isLoadingStats} 
                  subsidies={subsidies} 
                  isLoadingSubsidies={isLoadingSubsidies} 
                />
              </div>
              <div>
                <AuditLogsSummary />
              </div>
            </div>
            <div className="mt-6">
              <IntegratedDashboard />
            </div>
          </>
        )}
        
        {activeTab === 'charts' && (
          <DashboardCharts />
        )}
        
        {activeTab === 'client-stats' && (
          <SfdClientStatsDashboard />
        )}
        
        {activeTab === 'financial_reports' && (
          <FinancialReports />
        )}
        
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <ReportGenerator />
          </div>
        )}
        
        {activeTab === 'export' && (
          <div className="space-y-6">
            <DataExport />
          </div>
        )}
        
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
      
      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;

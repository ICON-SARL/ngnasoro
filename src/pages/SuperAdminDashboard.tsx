import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { 
  DashboardWidgets, 
  SuperAdminDashboardHeader, 
  DashboardTabs,
  DashboardCharts,
  RecentApprovals
} from '@/components/admin/dashboard';
import { useAdminDashboardData } from '@/hooks/useAdminDashboardData';
import { Reports } from '@/components/reports';
import { Button } from '@/components/ui/button';
import { FileText, Building, Users, Shield } from 'lucide-react';
import { AdminManagement } from '@/components/admin/AdminManagement';
import { SfdManagement } from '@/components/admin/SfdManagement';
import { MerefSfdCommunication } from '@/components/admin/shared/MerefSfdCommunication';
import { AdminNotifications } from '@/components/admin/shared/AdminNotifications';
import { IntegratedDashboard } from '@/components/admin/shared/IntegratedDashboard';
import AuditLogsSummary from '@/components/audit/AuditLogsSummary';
import { SubsidySummary } from '@/components/admin/dashboard/SubsidySummary';
import { PendingSubsidies } from '@/components/admin/dashboard/PendingSubsidies';
import { Footer } from '@/components';
import { FinancialReports } from '@/components/reports/FinancialReports';
import SfdInspector from '@/components/admin/SfdInspector';
import { Card, CardContent } from '@/components/ui/card';

const SuperAdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const navigate = useNavigate();
  
  // Fetch dashboard data
  const { dashboardData, isLoading } = useAdminDashboardData();
  
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
      <SuperAdminHeader additionalComponents={<AdminNotifications />} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <SuperAdminDashboardHeader />
        
        {/* Accès Rapides - Section améliorée */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Accès Rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Approbation de Crédit */}
            <Card 
              className="hover:shadow-md transition-all cursor-pointer border-gray-200"
              onClick={() => navigate('/credit-approval')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Approbation de Crédit</h3>
                  <p className="text-sm text-muted-foreground">Examiner et approuver les demandes</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Gestion des SFDs */}
            <Card
              className="hover:shadow-md transition-all cursor-pointer border-gray-200"
              onClick={() => navigate('/sfd-management')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <Building size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Gestion des SFDs</h3>
                  <p className="text-sm text-muted-foreground">Administrer les institutions partenaires</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Gestion Administrateurs */}
            <Card
              className="hover:shadow-md transition-all cursor-pointer border-gray-200"
              onClick={() => setSearchParams({ tab: 'admins' })}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Administrateurs</h3>
                  <p className="text-sm text-muted-foreground">Gestion des comptes admin</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Journal d'Audit */}
            <Card
              className="hover:shadow-md transition-all cursor-pointer border-gray-200"
              onClick={() => navigate('/audit-logs')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Journal d'Audit</h3>
                  <p className="text-sm text-muted-foreground">Historique des actions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Anciens boutons rapides - Masqués */}
        <div className="hidden mb-6 flex flex-wrap gap-2">
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
          
          <MerefSfdCommunication />
        </div>
        
        {/* Dashboard Widgets */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <SubsidySummary 
                    subsidiesData={dashboardData?.subsidies} 
                    isLoading={isLoading} 
                  />
                  <PendingSubsidies 
                    pendingRequests={dashboardData?.pendingRequests} 
                    isLoading={isLoading} 
                  />
                </div>
                <DashboardWidgets 
                  stats={dashboardData?.stats || {
                    activeSfds: 0,
                    newSfdsThisMonth: 0,
                    admins: 0,
                    newAdminsThisMonth: 0,
                    totalUsers: 0,
                    newUsersThisMonth: 0,
                  }} 
                  isLoading={isLoading} 
                />
              </div>
              <div>
                <RecentApprovals 
                  approvals={dashboardData?.recentApprovals}
                  isLoading={isLoading}
                />
                <div className="mt-6">
                  <AuditLogsSummary />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <IntegratedDashboard />
            </div>
          </>
        )}
        
        {/* Charts */}
        {activeTab === 'charts' && (
          <DashboardCharts />
        )}
        
        {/* Financial Reports */}
        {activeTab === 'financial_reports' && (
          <FinancialReports />
        )}
        
        {/* Reports */}
        {activeTab === 'reports' && (
          <Reports />
        )}
        
        {/* Admin Management */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <AdminManagement />
          </div>
        )}
        
        {/* SFD Inspector */}
        {activeTab === 'sfd-inspector' && (
          <div className="space-y-6">
            <SfdInspector />
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

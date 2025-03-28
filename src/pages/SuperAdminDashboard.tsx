
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
import { FileText, CreditCard, Building, Users, Lock } from 'lucide-react';
import { AdminManagement } from '@/components/admin/AdminManagement';
import { SubsidyRequestManagement } from '@/components/admin/subsidy';
import { RoleManagement } from '@/components/admin/roles/RoleManagement';
import { useAuth } from '@/hooks/auth';
import { UserPermissions } from '@/components/auth/UserPermissions';

const SuperAdminDashboard = () => {
  const { subsidies, isLoading: isLoadingSubsidies } = useSubsidies();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const { stats, isLoading: isLoadingStats } = useDashboardStats();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
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
          {hasPermission('approve_subsidies') && (
            <Button 
              variant="outline" 
              className="flex items-center bg-white" 
              onClick={() => navigate('/credit-approval')}
            >
              <CreditCard className="h-4 w-4 mr-2 text-[#0D6A51]" />
              Approbation de Crédit
            </Button>
          )}
          
          {hasPermission('manage_sfds') && (
            <Button 
              variant="outline" 
              className="flex items-center bg-white"
              onClick={() => navigate('/credit-approval?tab=sfd-management')}
            >
              <Building className="h-4 w-4 mr-2 text-[#0D6A51]" />
              Gestion des SFDs
            </Button>
          )}
          
          {hasPermission('view_all_reports') && (
            <Button 
              variant="outline" 
              className="flex items-center bg-white"
              onClick={() => setSearchParams({ tab: 'reports' })}
            >
              <FileText className="h-4 w-4 mr-2 text-[#0D6A51]" />
              Générer des Rapports
            </Button>
          )}
          
          {hasPermission('manage_users') && (
            <Button 
              variant="outline" 
              className="flex items-center bg-white"
              onClick={() => setSearchParams({ tab: 'users' })}
            >
              <Users className="h-4 w-4 mr-2 text-[#0D6A51]" />
              Gestion Administrateurs
            </Button>
          )}
          
          {hasPermission('manage_roles') && (
            <Button 
              variant="outline" 
              className="flex items-center bg-white"
              onClick={() => setSearchParams({ tab: 'roles' })}
            >
              <Lock className="h-4 w-4 mr-2 text-[#0D6A51]" />
              Gestion des Rôles
            </Button>
          )}
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
        
        {/* Subsidy Requests */}
        {activeTab === 'subsidy_requests' && (
          <div className="space-y-6">
            <SubsidyRequestManagement />
          </div>
        )}
        
        {/* Admin Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <AdminManagement />
          </div>
        )}
        
        {/* Role Management */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <RoleManagement />
          </div>
        )}
        
        {/* Permissions */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <UserPermissions showAll={true} />
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


import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { 
  DashboardWidgets, 
  SuperAdminDashboardHeader, 
  DashboardTabs,
  SimplifiedMerefDashboard
} from '@/components/admin/dashboard';
import { useAdminDashboardData } from '@/hooks/useAdminDashboardData';
import { Button } from '@/components/ui/button';
import { FileText, Building, Users, Shield } from 'lucide-react';
import { Footer } from '@/components';
import { Card, CardContent } from '@/components/ui/card';

const SuperAdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const navigate = useNavigate();
  
  const { dashboardData, isLoading } = useAdminDashboardData ? useAdminDashboardData() : { dashboardData: null, isLoading: false };
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <SuperAdminDashboardHeader />
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Accès Rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        
        {activeTab === 'dashboard' && (
          <>
            <SimplifiedMerefDashboard />
            <div className="mt-6">
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
          </>
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

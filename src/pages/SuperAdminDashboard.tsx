
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { 
  SuperAdminDashboardHeader, 
  DashboardTabs,
  SfdStatusAlert
} from '@/components/admin/dashboard';
import { MerefEnhancedDashboard } from '@/components/admin/meref/dashboard/MerefEnhancedDashboard';
import { AdminUsersList } from '@/components/admin/shared/AdminUsersList';
import { AddAdminDialog } from '@/components/admin/shared/AddAdminDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Building, Users, Shield, UserPlus } from 'lucide-react';
import { Footer } from '@/components';

const SuperAdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const navigate = useNavigate();
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };
  
  const handleCardClick = (path: string) => {
    if (path.startsWith('tab:')) {
      setSearchParams({ tab: path.substring(4) });
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <SuperAdminDashboardHeader />
        
        <SfdStatusAlert />
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Accès Rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card 
              className="hover:shadow-md transition-all cursor-pointer border-orange-200 border-2"
              onClick={() => handleCardClick('/sfd-approval')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Approbation SFDs</h3>
                  <p className="text-sm text-muted-foreground">Valider nouvelles SFDs</p>
                </div>
              </CardContent>
            </Card>
            <Card 
              className="hover:shadow-md transition-all cursor-pointer border-gray-200"
              onClick={() => handleCardClick('/credit-approval')}
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
              onClick={() => handleCardClick('/sfd-management')}
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
              onClick={() => handleCardClick('tab:admins')}
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
              onClick={() => handleCardClick('/admin/users')}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Utilisateurs</h3>
                  <p className="text-sm text-muted-foreground">Gestion des utilisateurs</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="mb-6">
          <DashboardTabs 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
        
        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <MerefEnhancedDashboard />
        )}
        
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Gestion des Administrateurs</h2>
              <Button onClick={() => setIsAddAdminDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Nouvel Admin
              </Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <AdminUsersList />
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Utilisateurs</h2>
              <Button onClick={() => navigate('/admin/users')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Voir Tous les Utilisateurs
              </Button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
              <p className="text-muted-foreground">
                Cette section affichera la liste des utilisateurs. Cliquez sur le bouton ci-dessus pour accéder à la page complète.
              </p>
            </div>
          </div>
        )}

        <AddAdminDialog 
          open={isAddAdminDialogOpen} 
          onOpenChange={setIsAddAdminDialogOpen} 
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;

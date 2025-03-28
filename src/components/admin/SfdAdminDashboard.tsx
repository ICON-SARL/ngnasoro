
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart4, 
  FileText, 
  Download, 
  LayoutDashboard,
  Users,
  CircleDollarSign,
  Building
} from 'lucide-react';
import { SfdRoleManager } from '@/components/sfd/roles/SfdRoleManager';
import { useAuth } from '@/hooks/auth';

const SfdAdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const { user, session } = useAuth();
  
  // Stats for the dashboard (these would come from an API in a real app)
  const stats = {
    totalClients: 352,
    activeLoans: 128,
    pendingApprovals: 17,
    monthlyDisbursements: '12.4M FCFA',
    newClientsThisMonth: 34,
    newLoansThisMonth: 22
  };
  
  // Set the active tab based on query parameter
  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'dashboard' });
    }
    
    // Update the local state when the search param changes
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams, setSearchParams]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-[#0D6A51] mr-2" />
              <span className="font-bold text-xl">SFD Admin</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="font-medium">{user?.full_name}</span>
                <span className="text-gray-500 block text-xs">{user?.email}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#0D6A51] text-white flex items-center justify-center">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord SFD</h1>
            <p className="text-gray-500">
              Gérez vos clients, prêts et utilisateurs
            </p>
          </div>
        </div>
        
        {/* Dashboard Widgets */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {stats.totalClients}
                  </div>
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  +{stats.newClientsThisMonth} ce mois
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Prêts Actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {stats.activeLoans}
                  </div>
                  <div className="p-2 bg-green-50 rounded-full">
                    <CircleDollarSign className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  +{stats.newLoansThisMonth} ce mois
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Approbations en attente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {stats.pendingApprovals}
                  </div>
                  <div className="p-2 bg-amber-50 rounded-full">
                    <FileText className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Traiter dès que possible
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Roles Management */}
        {activeTab === 'roles' && (
          <SfdRoleManager />
        )}
        
        {/* Clients Management */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Clients</CardTitle>
                <CardDescription>Gérez les clients de votre SFD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40 border rounded-md">
                  <p className="text-muted-foreground">Contenu de Gestion des Clients à venir...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Loans Management */}
        {activeTab === 'loans' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Prêts</CardTitle>
                <CardDescription>Gérez les prêts de votre SFD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40 border rounded-md">
                  <p className="text-muted-foreground">Contenu de Gestion des Prêts à venir...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rapports</CardTitle>
                <CardDescription>Générez des rapports pour votre SFD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40 border rounded-md">
                  <p className="text-muted-foreground">Module de Rapports à venir...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <CardDescription>Gérez les utilisateurs de votre SFD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40 border rounded-md">
                  <p className="text-muted-foreground">Contenu de Gestion des Utilisateurs à venir...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres</CardTitle>
                <CardDescription>Configurez les paramètres de votre SFD</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40 border rounded-md">
                  <p className="text-muted-foreground">Contenu des Paramètres à venir...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Dashboard Tabs */}
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
          <div className="bg-white rounded-full shadow-lg border px-2 py-1.5">
            <div className="flex space-x-1 p-1">
              <Button
                variant={activeTab === 'dashboard' ? "default" : "ghost"}
                size="sm"
                className="rounded-full"
                onClick={() => handleTabChange('dashboard')}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Tableau de bord
              </Button>
              
              <Button
                variant={activeTab === 'clients' ? "default" : "ghost"}
                size="sm"
                className="rounded-full"
                onClick={() => handleTabChange('clients')}
              >
                <Users className="h-4 w-4 mr-2" />
                Clients
              </Button>
              
              <Button
                variant={activeTab === 'loans' ? "default" : "ghost"}
                size="sm"
                className="rounded-full"
                onClick={() => handleTabChange('loans')}
              >
                <CircleDollarSign className="h-4 w-4 mr-2" />
                Prêts
              </Button>
              
              <Button
                variant={activeTab === 'reports' ? "default" : "ghost"}
                size="sm"
                className="rounded-full"
                onClick={() => handleTabChange('reports')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Rapports
              </Button>
              
              <Button
                variant={activeTab === 'roles' ? "default" : "ghost"}
                size="sm"
                className="rounded-full"
                onClick={() => handleTabChange('roles')}
              >
                <Users className="h-4 w-4 mr-2" />
                Rôles
              </Button>
              
              <Button
                variant={activeTab === 'users' ? "default" : "ghost"}
                size="sm"
                className="rounded-full"
                onClick={() => handleTabChange('users')}
              >
                <Users className="h-4 w-4 mr-2" />
                Utilisateurs
              </Button>
              
              <Button
                variant={activeTab === 'settings' ? "default" : "ghost"}
                size="sm"
                className="rounded-full"
                onClick={() => handleTabChange('settings')}
              >
                <Download className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SfdAdminDashboard;

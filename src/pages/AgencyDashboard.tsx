import React, { useState, useEffect } from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SfdUserManagement } from '@/components/sfd/user-management';
import { SfdRoleManager } from '@/components/sfd/roles';
import { ClientManagement } from '@/components/sfd/ClientManagement';
import { LoanManagement } from '@/components/sfd/LoanManagement';
import { ReportGenerator } from '@/components/ReportGenerator';
import { DataExport } from '@/components/DataExport';
import { FinancialReporting } from '@/components/FinancialReporting';
import { SfdDashboardStats } from '@/components/sfd/dashboard';
import { Statistics } from '@/components/sfd/Statistics';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import AdminLogout from '@/components/admin/shared/AdminLogout';

const AgencyDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(false);
  const { activeSfdId } = useAuth();
  const { toast } = useToast();
  const { user } = useAuth();

  const initializeDashboardData = async () => {
    if (!activeSfdId) return;
    
    setIsInitializing(true);
    try {
      const { data, error } = await supabase.functions.invoke('initialize_dashboard_data');
      
      if (error) {
        throw error;
      }
      
      if (data.success) {
        toast({
          title: 'Données initialisées',
          description: 'Les données de test ont été générées avec succès.',
        });
      } else {
        toast({
          title: 'Erreur',
          description: data.message || 'Une erreur est survenue lors de l\'initialisation des données.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error initializing dashboard data:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'initialisation des données.',
        variant: 'destructive'
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AgencyHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord SFD</h1>
            <p className="text-muted-foreground">Gestion de votre SFD et de ses services</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={initializeDashboardData}
              disabled={isInitializing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isInitializing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isInitializing ? 'Initialisation...' : 'Initialiser les données'}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                    {user?.full_name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden md:inline">{user?.full_name || "SFD User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="text-sm font-medium">{user?.full_name || "SFD User"}</div>
                  <div className="text-xs text-muted-foreground">{user?.email || "sfd@example.com"}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="flex items-center justify-between w-full">
                    Tableau de bord
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="flex items-center justify-between w-full">
                    Demandes de subvention
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500">
                  <AdminLogout variant="link" size="sm" className="p-0 h-auto hover:bg-transparent text-red-500">
                    Déconnexion
                  </AdminLogout>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <div className="border-b">
            <TabsList className="mx-4">
              <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="loans">Prêts</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
              <TabsTrigger value="roles">Rôles</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="mt-4">
            <TabsContent value="dashboard">
              <SfdDashboardStats />
              <Statistics />
            </TabsContent>
            
            <TabsContent value="clients">
              <ClientManagement />
            </TabsContent>
            
            <TabsContent value="loans">
              <LoanManagement />
            </TabsContent>
            
            <TabsContent value="users">
              <SfdUserManagement />
            </TabsContent>
            
            <TabsContent value="roles">
              <SfdRoleManager />
            </TabsContent>
            
            <TabsContent value="reports">
              <Tabs defaultValue="generator">
                <TabsList className="mb-4">
                  <TabsTrigger value="generator">Rapports automatisés</TabsTrigger>
                  <TabsTrigger value="trends">Tendances & Graphiques</TabsTrigger>
                  <TabsTrigger value="export">Export des données</TabsTrigger>
                </TabsList>
                
                <TabsContent value="generator">
                  <ReportGenerator />
                </TabsContent>
                
                <TabsContent value="trends">
                  <FinancialReporting />
                </TabsContent>
                
                <TabsContent value="export">
                  <DataExport />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default AgencyDashboard;

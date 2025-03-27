
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserManagement } from '@/components/UserManagement';
import SfdAccountRequests from '@/components/admin/SfdAccountRequests';
import { SubsidyManagement } from '@/components/admin/SubsidyManagement';
import { SfdManagement } from '@/components/admin/SfdManagement';
import { SystemSettings } from '@/components/admin/settings/SystemSettings';
import { DashboardWidgets } from '@/components/admin/dashboard/DashboardWidgets';
import { DashboardCharts } from '@/components/admin/dashboard/DashboardCharts';
import { 
  BarChart, 
  PieChart, 
  Building, 
  Users, 
  ShieldCheck, 
  Settings, 
  ArrowUpRight, 
  CircleDollarSign 
} from 'lucide-react';
import { useSubsidies } from '@/hooks/useSubsidies';
import { CreditDecisionFlow } from '@/components/CreditDecisionFlow';
import { supabase } from '@/integrations/supabase/client';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const SuperAdminDashboard = () => {
  const { subsidies, isLoading: isLoadingSubsidies } = useSubsidies();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const { stats, isLoading: isLoadingStats } = useDashboardStats();
  
  // Set the active tab based on query parameter
  useEffect(() => {
    if (searchParams.get('tab')) {
      // tab is already set in URL
    } else {
      setSearchParams({ tab: 'dashboard' });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord Super Admin - MEREF</h1>
            <p className="text-gray-500">
              Gérez les SFDs, les comptes administrateurs et les subventions
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Badge className="bg-[#FFAB2E]/10 text-[#FFAB2E] border-[#FFAB2E]/20 rounded-md px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Mode Super Administrateur
            </Badge>
          </div>
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
        
        <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })} className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="sfds">Gestion SFDs</TabsTrigger>
            <TabsTrigger value="sfd-requests">Demandes SFD</TabsTrigger>
            <TabsTrigger value="subsidies">Subventions</TabsTrigger>
            <TabsTrigger value="user-management">Administrateurs</TabsTrigger>
            <TabsTrigger value="credit-approval">Approbation de Crédit</TabsTrigger>
            <TabsTrigger value="analytics">Analytique</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activité Récente</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Tableau de bord principal en chargement...</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques Générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Les statistiques sont en cours de chargement...</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sfds" className="mt-6">
            <SfdManagement />
          </TabsContent>
          
          <TabsContent value="sfd-requests" className="mt-6">
            <SfdAccountRequests />
          </TabsContent>
          
          <TabsContent value="subsidies" className="mt-6">
            <SubsidyManagement />
          </TabsContent>
          
          <TabsContent value="user-management" className="mt-6">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="credit-approval" className="mt-6">
            <CreditDecisionFlow />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <DashboardCharts />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

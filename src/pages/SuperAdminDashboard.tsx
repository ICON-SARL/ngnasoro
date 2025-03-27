
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserManagement } from '@/components/UserManagement';
import SfdAccountRequests from '@/components/admin/SfdAccountRequests';
import { SubsidyManagement } from '@/components/admin/SubsidyManagement';
import { BarChart, PieChart, Building, Users, ShieldCheck, Settings, ArrowUpRight, CreditCard, DollarSign, CircleDollarSign } from 'lucide-react';
import { useSubsidies } from '@/hooks/useSubsidies';
import { CreditDecisionFlow } from '@/components/CreditDecisionFlow';

const SuperAdminDashboard = () => {
  const { subsidies, isLoading: isLoadingSubsidies } = useSubsidies();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord Super Admin - MEREF</h1>
            <p className="text-gray-500">
              Gérez les SFDs, les comptes utilisateurs et les subventions
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Badge className="bg-[#FFAB2E]/10 text-[#FFAB2E] border-[#FFAB2E]/20 rounded-md px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Mode Super Administrateur
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">SFDs Actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">12</div>
                <div className="p-2 bg-green-50 rounded-full">
                  <Building className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span>+2 ce mois</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Utilisateurs Totaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">24,581</div>
                <div className="p-2 bg-blue-50 rounded-full">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span>+1,245 ce mois</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Prêts Subventionnés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">1,284</div>
                <div className="p-2 bg-purple-50 rounded-full">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span>+52 ce mois</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Subventions Allouées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {isLoadingSubsidies 
                    ? "..." 
                    : `${(subsidies.reduce((sum, subsidy) => sum + subsidy.amount, 0) / 1000000).toFixed(1)}M FCFA`}
                </div>
                <div className="p-2 bg-[#0D6A51]/10 rounded-full">
                  <CircleDollarSign className="h-5 w-5 text-[#0D6A51]" />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span>+15.2M ce mois</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="subsidies" className="space-y-6">
          <TabsList>
            <TabsTrigger value="subsidies">Subventions</TabsTrigger>
            <TabsTrigger value="credit-approval">Approbation de Crédit</TabsTrigger>
            <TabsTrigger value="sfd-requests">Demandes SFD</TabsTrigger>
            <TabsTrigger value="user-management">Gestion Utilisateurs</TabsTrigger>
            <TabsTrigger value="analytics">Analytique</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subsidies" className="mt-6">
            <SubsidyManagement />
          </TabsContent>
          
          <TabsContent value="credit-approval" className="mt-6">
            <CreditDecisionFlow />
          </TabsContent>
          
          <TabsContent value="sfd-requests" className="mt-6">
            <SfdAccountRequests />
          </TabsContent>
          
          <TabsContent value="user-management" className="mt-6">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des Utilisateurs par SFD</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <PieChart className="h-64 w-64 text-gray-300" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Croissance Mensuelle des Comptes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <BarChart className="h-64 w-64 text-gray-300" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

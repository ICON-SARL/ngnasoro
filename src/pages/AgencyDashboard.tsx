
import React, { useState } from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SfdUserManagement } from '@/components/sfd/SfdUserManagement';
import { SfdRoleManager } from '@/components/sfd/roles'; 
import { ClientManagement } from '@/components/sfd/ClientManagement';
import { LoanManagement } from '@/components/sfd/LoanManagement';
import { Reports } from '@/components/reports';
import { FinancialReporting } from '@/components/FinancialReporting';
import { useSfdDashboardStats } from '@/hooks/useSfdDashboardStats';
import { Loader2 } from 'lucide-react';
import { SfdDashboardStats } from '@/components/sfd/dashboard/SfdDashboardStats';
import { useNavigate } from 'react-router-dom';

const AgencyDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { data: dashboardStats, isLoading } = useSfdDashboardStats();
  const navigate = useNavigate();

  // Format currency function
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
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
        </div>
        
        <SfdDashboardStats />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
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
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                  <p>Chargement des statistiques...</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Clients</CardTitle>
                      <CardDescription>Résumé de vos clients</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats?.clients.total || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        +{dashboardStats?.clients.percentageChange || 0}% depuis le mois dernier
                      </p>
                      <Button 
                        variant="link" 
                        className="p-0 mt-2 text-[#0D6A51]"
                        onClick={() => navigate('/sfd-clients')}
                      >
                        Voir tous les clients
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Prêts actifs</CardTitle>
                      <CardDescription>Prêts en cours</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats?.loans.active || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Total: {formatCurrency(dashboardStats?.loans.totalAmount || 0)}
                      </p>
                      <Button 
                        variant="link" 
                        className="p-0 mt-2 text-[#0D6A51]"
                        onClick={() => navigate('/sfd-loans')}
                      >
                        Gérer les prêts
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Remboursements</CardTitle>
                      <CardDescription>Ce mois-ci</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(dashboardStats?.repayments.currentMonth || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardStats?.repayments.repaymentRate || 0}% taux de remboursement
                      </p>
                      <Button 
                        variant="link" 
                        className="p-0 mt-2 text-[#0D6A51]"
                        onClick={() => navigate('/sfd-transactions')}
                      >
                        Voir les transactions
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
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
              <Reports />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default AgencyDashboard;

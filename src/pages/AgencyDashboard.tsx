
import React, { useState } from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SfdUserManagement } from '@/components/sfd/SfdUserManagement';
import { SfdRoleManager } from '@/components/sfd/roles'; // Updated import path
import { ClientManagement } from '@/components/sfd/ClientManagement';
import { LoanManagement } from '@/components/sfd/LoanManagement';
import { ReportGenerator } from '@/components/ReportGenerator';
import { DataExport } from '@/components/DataExport';
import { FinancialReporting } from '@/components/FinancialReporting';

const AgencyDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Clients</CardTitle>
                    <CardDescription>Résumé de vos clients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">245</div>
                    <p className="text-xs text-muted-foreground">+12% depuis le mois dernier</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Prêts actifs</CardTitle>
                    <CardDescription>Prêts en cours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">86</div>
                    <p className="text-xs text-muted-foreground">Total: 12,450,000 FCFA</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Remboursements</CardTitle>
                    <CardDescription>Ce mois-ci</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,245,000 FCFA</div>
                    <p className="text-xs text-muted-foreground">98% taux de remboursement</p>
                  </CardContent>
                </Card>
              </div>
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


import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientManagement } from '@/components/sfd/ClientManagement';
import { LoanManagement } from '@/components/sfd/LoanManagement';
import { SfdAdminLayout } from '@/components/sfd/SfdAdminLayout';
import { SfdDashboard } from '@/components/sfd/SfdDashboard';
import { SfdUserManagement } from '@/components/sfd/SfdUserManagement';
import { Button } from '@/components/ui/button';
import { Settings, Users, CreditCard, Home, FileSpreadsheet, UserCog } from 'lucide-react';

export default function AgencyDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <SfdAdminLayout>
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord SFD</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <TabsList className="grid grid-cols-5 gap-2">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#0D6A51] data-[state=active]:text-white">
                <Home className="h-4 w-4 mr-2" />
                Tableau de bord
              </TabsTrigger>
              <TabsTrigger value="clients" className="data-[state=active]:bg-[#0D6A51] data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="loans" className="data-[state=active]:bg-[#0D6A51] data-[state=active]:text-white">
                <CreditCard className="h-4 w-4 mr-2" />
                Prêts
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-[#0D6A51] data-[state=active]:text-white">
                <UserCog className="h-4 w-4 mr-2" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-[#0D6A51] data-[state=active]:text-white">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Rapports
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4">
            <SfdDashboard />
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <ClientManagement />
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <LoanManagement />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <SfdUserManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Rapports et Analyses</h2>
                <p className="text-muted-foreground mb-6">
                  Module de rapports et d'analyses pour suivre les performances de vos opérations de microfinance.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto flex flex-col items-start p-4 justify-start">
                    <div className="font-medium mb-1">Rapport de performance</div>
                    <div className="text-sm text-muted-foreground text-left">
                      Vue d'ensemble des performances de vos portefeuilles de prêts.
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto flex flex-col items-start p-4 justify-start">
                    <div className="font-medium mb-1">Rapport de remboursement</div>
                    <div className="text-sm text-muted-foreground text-left">
                      Analyse détaillée des taux de remboursement par catégorie.
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="h-auto flex flex-col items-start p-4 justify-start">
                    <div className="font-medium mb-1">Clients en retard</div>
                    <div className="text-sm text-muted-foreground text-left">
                      Liste des clients ayant des échéances de remboursement dépassées.
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SfdAdminLayout>
  );
}

import React, { useState } from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SfdUserManagement } from '@/components/sfd/SfdUserManagement';
import { SfdRoleManager } from '@/components/sfd/roles'; 
import { ClientManagement } from '@/components/sfd/ClientManagement';
import { LoanManagement } from '@/components/sfd/LoanManagement';
import { Reports } from '@/components/reports';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { Loader2, ClipboardList, RefreshCw } from 'lucide-react';
import { SfdDashboardStats } from '@/components/sfd/dashboard/SfdDashboardStats';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/utils/formatters';

const AgencyDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { adhesionRequests, isLoadingAdhesionRequests, refetchAdhesionRequests } = useClientAdhesions();
  const { toast } = useToast();

  const pendingAdhesions = adhesionRequests.filter(req => req.status === 'pending');

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
        
        {pendingAdhesions.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-lg">Demandes d'adhésion en attente</CardTitle>
                  <Badge variant="outline" className="ml-2">{pendingAdhesions.length}</Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchAdhesionRequests()}
                  className="h-8"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Actualiser
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAdhesionRequests ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom complet</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date de demande</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingAdhesions.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.full_name}</TableCell>
                        <TableCell>
                          {request.email && <div className="text-sm">{request.email}</div>}
                          {request.phone && <div className="text-sm">{request.phone}</div>}
                        </TableCell>
                        <TableCell>{formatDate(request.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setActiveTab('clients')}
                          >
                            Voir les détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
        
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
              ) : null}
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

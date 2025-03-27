import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Settings, 
  Database, 
  Workflow, 
  Link, 
  UserCog, 
  CreditCard, 
  Building, 
  Plus,
  Activity
} from 'lucide-react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { LoanWorkflow } from '@/components/LoanWorkflow';
import { ApiIntegration } from '@/components/ApiIntegration';
import { UserManagement } from '@/components/UserManagement';
import { DataExport } from '@/components/DataExport';
import { LoanManagement } from '@/components/sfd/LoanManagement';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { useSfdClients } from '@/hooks/useSfdClients';
import { useSubsidies } from '@/hooks/useSubsidies';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { RealTimeTransactions } from '@/components/RealTimeTransactions';

const AgencyDashboard = () => {
  const { loans, isLoading: isLoadingLoans } = useSfdLoans();
  const { clients, isLoading: isLoadingClients } = useSfdClients();
  const { subsidies, isLoading: isLoadingSubsidies } = useSubsidies();
  const { synchronizeBalances } = useSfdAccounts();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [synchronizing, setSynchronizing] = useState(false);
  
  const activeLoans = !isLoadingLoans ? loans.filter(l => l.status === 'active').length : 0;
  const totalLoanAmount = !isLoadingLoans ? 
    loans.filter(l => l.status === 'active' || l.status === 'completed')
      .reduce((sum, loan) => sum + loan.amount, 0) : 0;
  
  const clientCount = !isLoadingClients ? clients.length : 0;
  
  const repaymentRate = 92;

  const handleSynchronize = async () => {
    try {
      setSynchronizing(true);
      await synchronizeBalances.mutateAsync();
      toast({
        title: "Synchronisation réussie",
        description: "Les données ont été synchronisées avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur de synchronisation",
        description: "Une erreur est survenue lors de la synchronisation",
        variant: "destructive",
      });
    } finally {
      setSynchronizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Tableau de Bord Agence SFD</h1>
            <p className="text-muted-foreground">Gestion des services financiers décentralisés</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSynchronize}
              disabled={synchronizing}
            >
              <Settings className="mr-2 h-4 w-4" />
              {synchronizing ? 'Synchronisation...' : 'Synchroniser'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Prêts actifs</p>
                <h3 className="text-2xl font-semibold">{isLoadingLoans ? '...' : activeLoans}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51]">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Clients</p>
                <h3 className="text-2xl font-semibold">{isLoadingClients ? '...' : clientCount}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51]">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Taux de rembours.</p>
                <h3 className="text-2xl font-semibold">{repaymentRate}%</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51]">
                <Settings className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Capital Prêté</p>
                <h3 className="text-2xl font-semibold">
                  {isLoadingLoans ? '...' : `${(totalLoanAmount / 1000000).toFixed(1)}M`}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51]">
                <Building className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="loans" className="mb-8">
          <TabsList className="mb-4 bg-white">
            <TabsTrigger value="loans" className="data-[state=active]:bg-[#0D6A51]/10 data-[state=active]:text-[#0D6A51]">
              <CreditCard className="h-4 w-4 mr-2" />
              Gestion des Prêts
            </TabsTrigger>
            <TabsTrigger value="workflow" className="data-[state=active]:bg-[#0D6A51]/10 data-[state=active]:text-[#0D6A51]">
              <Workflow className="h-4 w-4 mr-2" />
              Workflow de Prêts
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-[#0D6A51]/10 data-[state=active]:text-[#0D6A51]">
              <Activity className="h-4 w-4 mr-2" />
              Supervision Transactions
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-[#0D6A51]/10 data-[state=active]:text-[#0D6A51]">
              <Link className="h-4 w-4 mr-2" />
              API Bancaires
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[#0D6A51]/10 data-[state=active]:text-[#0D6A51]">
              <UserCog className="h-4 w-4 mr-2" />
              Collaborateurs
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-[#0D6A51]/10 data-[state=active]:text-[#0D6A51]">
              <Database className="h-4 w-4 mr-2" />
              Export Données
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="loans" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Gestion des Prêts</h2>
                <p className="text-muted-foreground">Gérez les prêts de votre SFD et les subventions MEREF</p>
              </div>
              
              <Button onClick={() => navigate('/loans/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Prêt
              </Button>
            </div>
            <LoanManagement />
          </TabsContent>
          
          <TabsContent value="workflow" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <LoanWorkflow />
          </TabsContent>
          
          <TabsContent value="transactions" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <RealTimeTransactions />
          </TabsContent>
          
          <TabsContent value="api" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <ApiIntegration />
          </TabsContent>
          
          <TabsContent value="users" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="export" className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <DataExport />
          </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Subventions disponibles</h3>
                <Button variant="outline" size="sm" onClick={() => navigate('/subsidies')}>
                  Voir tout
                </Button>
              </div>
              {isLoadingSubsidies ? (
                <p className="text-muted-foreground">Chargement des subventions...</p>
              ) : (
                <div className="space-y-4">
                  {subsidies.filter(s => s.status === 'active').length > 0 ? (
                    subsidies
                      .filter(s => s.status === 'active')
                      .slice(0, 3)
                      .map(subsidy => (
                        <div key={subsidy.id} className="border rounded-md p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{subsidy.description || 'Subvention MEREF'}</p>
                            <p className="text-sm text-muted-foreground">
                              {((subsidy.used_amount / subsidy.amount) * 100).toFixed(0)}% utilisé
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-[#0D6A51]">
                              {subsidy.remaining_amount.toLocaleString()} FCFA
                            </p>
                            <p className="text-xs text-muted-foreground">
                              sur {subsidy.amount.toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-muted-foreground">Aucune subvention active</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Activités récentes</h3>
                <Button variant="outline" size="sm" onClick={() => navigate('/activities')}>
                  Voir tout
                </Button>
              </div>
              {isLoadingLoans ? (
                <p className="text-muted-foreground">Chargement des activités...</p>
              ) : (
                <div className="space-y-4">
                  {loans.length > 0 ? (
                    loans
                      .slice(0, 4)
                      .map(loan => {
                        const client = clients.find(c => c.id === loan.client_id);
                        return (
                          <div key={loan.id} className="border rounded-md p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{client?.full_name || 'Client inconnu'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {loan.status === 'pending' ? 'Demande de prêt' : 
                                   loan.status === 'approved' ? 'Prêt approuvé' : 
                                   loan.status === 'active' ? 'Prêt actif' : 
                                   loan.status === 'completed' ? 'Prêt terminé' : 'Prêt en défaut'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{loan.amount.toLocaleString()} FCFA</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(loan.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <p className="text-muted-foreground">Aucune activité récente</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;

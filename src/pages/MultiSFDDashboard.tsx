
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Users, CreditCard, Clock, Bell, User, LogOut } from 'lucide-react';
import MultiSFDAccounts from '@/components/MultiSFDAccounts';
import { LoanWorkflow } from '@/components/LoanWorkflow';

const MultiSFDDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
              alt="NGNA SÔRÔ! Logo" 
              className="h-8"
            />
            <div className="ml-2">
              <h1 className="text-lg font-semibold flex items-center">
                <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
                <Badge className="ml-2 bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-xs">Multi-SFD</Badge>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only">Notifications</span>
            </Button>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                <User className="h-4 w-4" />
              </div>
              <span className="font-medium hidden md:inline">Ibrahim Koné</span>
            </div>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Tableau de bord multi-institutions</h2>
          <p className="text-muted-foreground">
            Gérez vos comptes et prêts à travers différentes institutions financières
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Building className="h-4 w-4 mr-2 text-[#0D6A51]" />
                Institutions connectées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-sm text-muted-foreground">SFDs avec comptes actifs</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-[#0D6A51]" />
                Solde total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">425,000 FCFA</div>
              <p className="text-sm text-muted-foreground">Sur tous les comptes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Clock className="h-4 w-4 mr-2 text-[#0D6A51]" />
                Prochaine échéance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">02/05/2023</div>
              <div className="flex items-center">
                <p className="text-sm text-muted-foreground mr-2">Paiement de 25,000 FCFA</p>
                <Badge variant="destructive">Urgent</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="accounts" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="accounts">
              <Building className="h-4 w-4 mr-2" />
              Mes Comptes SFD
            </TabsTrigger>
            <TabsTrigger value="loans">
              <CreditCard className="h-4 w-4 mr-2" />
              Prêts & Financement
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <Clock className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts">
            <MultiSFDAccounts />
          </TabsContent>
          
          <TabsContent value="loans">
            <LoanWorkflow />
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Historique des transactions</CardTitle>
                <CardDescription>
                  Transactions consolidées à travers toutes les institutions SFD
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Historique unifié</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    Cette fonctionnalité affiche un historique transactionnel consolidé de toutes vos institutions SFD connectées.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card className="bg-[#0D6A51]/5 border-[#0D6A51]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center text-[#0D6A51]">
              <Users className="h-4 w-4 mr-2" />
              Synchronisation Multi-SFD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Vos données KYC sont synchronisées et partagées de manière sécurisée entre les institutions connectées, 
              dans le respect du cadre réglementaire des services financiers décentralisés.
            </p>
            <div className="mt-2">
              <Button variant="outline" size="sm" className="text-[#0D6A51] border-[#0D6A51]/30">
                Gérer les permissions
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MultiSFDDashboard;


import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import ClientsOverview from './clients/ClientsOverview';
import { StatsOverview } from './dashboard/StatsOverview';
import { SfdAccountsManager } from './sfd-accounts/SfdAccountsManager';
import { SfdStatusAlert } from './dashboard/SfdStatusAlert';
import { useSfdStatusCheck } from '@/hooks/useSfdStatusCheck';

const SfdAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { data: sfdStatus } = useSfdStatusCheck();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord SFD</h1>
        <p className="text-muted-foreground">
          {user?.email ? `Connecté en tant que ${user.email}` : 'Bienvenue dans votre tableau de bord SFD'}
        </p>
      </div>
      
      {/* Afficher l'alerte si aucune SFD active n'est détectée */}
      {sfdStatus && !sfdStatus.hasActiveSfds && (
        <SfdStatusAlert />
      )}
      
      <Tabs 
        defaultValue="overview" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList className="grid md:grid-cols-4 grid-cols-2 w-full">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="accounts">Comptes SFD</TabsTrigger>
          <TabsTrigger value="loans">Prêts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <StatsOverview />
        </TabsContent>
        
        <TabsContent value="clients" className="space-y-6">
          <ClientsOverview />
        </TabsContent>
        
        <TabsContent value="accounts" className="space-y-6">
          <SfdAccountsManager />
        </TabsContent>
        
        <TabsContent value="loans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prêts en cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p>La gestion des prêts sera disponible prochainement.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SfdAdminDashboard;


import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SfdDashboard } from './SfdDashboard';
import { SfdAccountsOverview } from './accounts/SfdAccountsOverview';
import { SfdLoansOverview } from './loans/SfdLoansOverview';
import { ClientManagementSystem } from './ClientManagementSystem';
import { useAuth } from '@/hooks/useAuth';

const SfdAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord SFD</h1>
        <p className="text-muted-foreground">
          {user?.email ? `Connecté en tant que ${user.email}` : 'Bienvenue dans votre tableau de bord SFD'}
        </p>
      </div>
      
      <Tabs 
        defaultValue={activeTab} 
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
          <SfdDashboard />
        </TabsContent>
        
        <TabsContent value="clients" className="space-y-6">
          <ClientManagementSystem />
        </TabsContent>
        
        <TabsContent value="accounts" className="space-y-6">
          <SfdAccountsOverview />
        </TabsContent>
        
        <TabsContent value="loans" className="space-y-6">
          <SfdLoansOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SfdAdminDashboard;

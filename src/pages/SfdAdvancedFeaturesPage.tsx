
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgencyHeader } from '@/components/AgencyHeader';
import LoanSimulator from '@/components/admin/loans/LoanSimulator';
import ClientReferralSystem from '@/components/admin/clients/ClientReferralSystem';
import KycAutomationSystem from '@/components/admin/clients/KycAutomationSystem';
import StaffManagement from '@/components/admin/staff/StaffManagement';
import { useSearchParams } from 'react-router-dom';

export const SfdAdvancedFeaturesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'clients';
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Fonctionnalités Avancées SFD</h1>
          <p className="text-muted-foreground">
            Outils avancés pour la gestion des clients, des prêts et du personnel
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="w-full justify-start overflow-auto">
            <TabsTrigger value="clients">Gestion des Clients</TabsTrigger>
            <TabsTrigger value="loans">Optimisation des Prêts</TabsTrigger>
            <TabsTrigger value="staff">Gestion du Personnel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="clients" className="space-y-6">
            <div className="grid gap-6">
              <ClientReferralSystem />
              <KycAutomationSystem />
            </div>
          </TabsContent>
          
          <TabsContent value="loans" className="space-y-6">
            <div className="grid gap-6">
              <LoanSimulator />
            </div>
          </TabsContent>
          
          <TabsContent value="staff" className="space-y-6">
            <div className="grid gap-6">
              <StaffManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SfdAdvancedFeaturesPage;

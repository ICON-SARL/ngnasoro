
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdScoringSystem } from '@/components/admin/sfd-scoring/SfdScoringSystem';
import { SubventionManagement } from '@/components/admin/subventions/SubventionManagement';
import { FraudDetectionSystem } from '@/components/admin/security/FraudDetectionSystem';
import { RegulatoryUpdates } from '@/components/admin/regulatory/RegulatoryUpdates';
import { AiAssistant } from '@/components/admin/chatbot/AiAssistant';
import { AdminNotifications } from '@/components/admin/shared/AdminNotifications';
import { useSearchParams } from 'react-router-dom';

export const MerefAdvancedFeaturesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'scoring';
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader additionalComponents={<AdminNotifications />} />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Fonctionnalités Avancées MEREF</h1>
          <p className="text-muted-foreground">
            Outils de supervision et d'administration pour le Ministère de l'Économie et des Finances
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap">
                <TabsTrigger value="scoring">Notation des SFDs</TabsTrigger>
                <TabsTrigger value="subventions">Gestion des Subventions</TabsTrigger>
                <TabsTrigger value="fraud">Détection de Fraude</TabsTrigger>
                <TabsTrigger value="regulatory">Mises à Jour Réglementaires</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scoring" className="space-y-6">
                <SfdScoringSystem />
              </TabsContent>
              
              <TabsContent value="subventions" className="space-y-6">
                <SubventionManagement />
              </TabsContent>
              
              <TabsContent value="fraud" className="space-y-6">
                <FraudDetectionSystem />
              </TabsContent>
              
              <TabsContent value="regulatory" className="space-y-6">
                <RegulatoryUpdates />
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <AiAssistant />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MerefAdvancedFeaturesPage;


import React, { useState } from 'react';
import { SubsidyRequestsList } from './SubsidyRequestsList';
import { SubsidyRequestDetail } from './SubsidyRequestDetail';
import { SubsidyRequestCreate } from './request-create';
import { SubsidyAlertSettings } from './SubsidyAlertSettings';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SubsidyRequestManagement() {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setActiveTab('detail');
  };

  const handleBackToList = () => {
    setSelectedRequestId(null);
    setActiveTab('list');
  };

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Demandes</TabsTrigger>
          <TabsTrigger value="new">Nouvelle Demande</TabsTrigger>
          <TabsTrigger value="detail" disabled={!selectedRequestId}>Détails</TabsTrigger>
          <TabsTrigger value="settings">Paramètres d'alerte</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <SubsidyRequestsList onSelectRequest={handleSelectRequest} />
        </TabsContent>
        
        <TabsContent value="new">
          <SubsidyRequestCreate onSuccess={() => setActiveTab('list')} />
        </TabsContent>
        
        <TabsContent value="detail">
          {selectedRequestId && (
            <SubsidyRequestDetail 
              requestId={selectedRequestId} 
              onBack={handleBackToList} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <SubsidyAlertSettings />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

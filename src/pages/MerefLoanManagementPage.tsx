
import React, { useState } from 'react';
import { MerefLoanRequestsList } from '@/components/sfd/meref/MerefLoanRequestsList';
import { MerefLoanRequestForm } from '@/components/sfd/meref/MerefLoanRequestForm';
import { MerefLoanRequestDetail } from '@/components/sfd/meref/MerefLoanRequestDetail';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MerefLoanManagementPage = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
  const handleSelectRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setActiveTab('detail');
  };
  
  const handleBackToList = () => {
    setSelectedRequestId(null);
    setActiveTab('list');
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des Prêts MEREF</h1>
      
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="list">Liste des demandes</TabsTrigger>
            <TabsTrigger value="new">Nouvelle demande</TabsTrigger>
            <TabsTrigger value="detail" disabled={!selectedRequestId}>
              Détails
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <MerefLoanRequestsList onSelectRequest={handleSelectRequest} />
          </TabsContent>
          
          <TabsContent value="new">
            <MerefLoanRequestForm onSuccess={handleBackToList} />
          </TabsContent>
          
          <TabsContent value="detail">
            {selectedRequestId && (
              <MerefLoanRequestDetail
                requestId={selectedRequestId}
                onBack={handleBackToList}
              />
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default MerefLoanManagementPage;

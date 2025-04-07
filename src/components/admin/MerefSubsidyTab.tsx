
import React, { useState } from 'react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubsidyRequestDetail } from '@/components/admin/subsidy/SubsidyRequestDetail';
import { SubsidyRequestsList } from '@/components/admin/subsidy/SubsidyRequestsList';
import { SubsidyAlertSettings } from '@/components/admin/subsidy/SubsidyAlertSettings';

export const MerefSubsidyTab = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const {
    subsidyRequests,
    isLoading,
    alertThresholds,
    isLoadingThresholds
  } = useSubsidyRequests();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="requests">Demandes de subvention</TabsTrigger>
        <TabsTrigger value="details" disabled={!selectedRequestId}>Détails</TabsTrigger>
        <TabsTrigger value="settings">Paramètres d'alerte</TabsTrigger>
      </TabsList>

      <TabsContent value="requests">
        <Card>
          <CardHeader>
            <CardTitle>Demandes de subvention</CardTitle>
          </CardHeader>
          <CardContent>
            <SubsidyRequestsList 
              subsidyRequests={subsidyRequests} 
              isLoading={isLoading} 
              onSelectRequest={(id) => {
                setSelectedRequestId(id);
                setActiveTab('details');
              }}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="details">
        {selectedRequestId && (
          <SubsidyRequestDetail 
            requestId={selectedRequestId} 
            onBack={() => {
              setSelectedRequestId(null);
              setActiveTab('requests');
            }} 
          />
        )}
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres d'alerte de subvention</CardTitle>
          </CardHeader>
          <CardContent>
            <SubsidyAlertSettings 
              thresholds={alertThresholds} 
              isLoading={isLoadingThresholds} 
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

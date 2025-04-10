
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientManagementSystem } from './ClientManagementSystem';
import ClientRequests from './ClientRequests';
import { Badge } from '@/components/ui/badge';
import { useSfdClients } from '@/hooks/useSfdClients';

export const ClientManagement = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const { clients } = useSfdClients();
  
  // Count pending requests
  const pendingRequestsCount = clients.filter(client => client.status === 'pending').length;
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center">
            Demandes d'accès
            {pendingRequestsCount > 0 && (
              <Badge className="ml-2 bg-amber-500 hover:bg-amber-500">
                {pendingRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients">
          <ClientManagementSystem />
        </TabsContent>
        
        <TabsContent value="requests">
          <ClientRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientManagement;

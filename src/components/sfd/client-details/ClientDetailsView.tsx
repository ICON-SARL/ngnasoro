
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { User } from 'lucide-react';

import { ClientDetailsHeader } from './ClientDetailsHeader';
import { ClientDetailsTab } from './ClientDetailsTab';
import { ClientActivityTab } from './ClientActivityTab';
import { ClientBankAccountTab } from './ClientBankAccountTab';
import { ClientStatusBadge } from '../ClientStatusBadge';

interface ClientDetailsViewProps {
  client: any;
  onClose: () => void;
}

export default function ClientDetailsView({ client, onClose }: ClientDetailsViewProps) {
  const [activeTab, setActiveTab] = useState('details');
  
  if (!client) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientDetailsHeader 
        client={client} 
        onClose={onClose} 
      />
      
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Informations</TabsTrigger>
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="p-4">
          <ClientDetailsTab client={client} />
        </TabsContent>
        
        <TabsContent value="accounts" className="p-4">
          <ClientBankAccountTab client={client} />
        </TabsContent>
        
        <TabsContent value="activities" className="p-4">
          <ClientActivityTab clientId={client.id} />
        </TabsContent>
        
        <TabsContent value="documents" className="p-4">
          <div className="text-center p-8">
            <p className="text-gray-500">Cette fonctionnalité sera bientôt disponible.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

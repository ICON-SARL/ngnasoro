
import React, { useState } from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw 
} from 'lucide-react';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { AdhesionRequestsTable } from '@/components/sfd/AdhesionRequestsTable';

export default function AdhesionRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const { 
    adhesionRequests, 
    isLoadingAdhesionRequests,
    refetchAdhesionRequests 
  } = useClientAdhesions();

  const filteredRequests = adhesionRequests.filter(request => 
    request.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.phone?.includes(searchTerm)
  );

  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  const approvedRequests = filteredRequests.filter(r => r.status === 'approved');
  const rejectedRequests = filteredRequests.filter(r => r.status === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Demandes d'adhésion</h1>
          <p className="text-muted-foreground">
            Gérez les demandes d'adhésion des clients à votre SFD
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Demandes d'adhésion client</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refetchAdhesionRequests}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher par nom, email ou téléphone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="pending" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    En attente <Badge variant="outline" className="ml-2">{pendingRequests.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuvées <Badge variant="outline" className="ml-2">{approvedRequests.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="flex items-center">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejetées <Badge variant="outline" className="ml-2">{rejectedRequests.length}</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending">
                  <AdhesionRequestsTable 
                    requests={pendingRequests}
                    isLoading={isLoadingAdhesionRequests}
                  />
                </TabsContent>

                <TabsContent value="approved">
                  <AdhesionRequestsTable 
                    requests={approvedRequests}
                    isLoading={isLoadingAdhesionRequests}
                  />
                </TabsContent>

                <TabsContent value="rejected">
                  <AdhesionRequestsTable 
                    requests={rejectedRequests}
                    isLoading={isLoadingAdhesionRequests}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

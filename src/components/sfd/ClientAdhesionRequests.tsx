import React, { useState, useEffect } from 'react';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { AdhesionRequestsTable } from './AdhesionRequestsTable';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ClientAdhesionRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  
  const { 
    adhesionRequests, 
    isLoadingAdhesionRequests, 
    refetchAdhesionRequests,
    retryCount
  } = useClientAdhesions();
  
  const filteredRequests = adhesionRequests.filter(request => 
    request.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.phone?.includes(searchTerm) ||
    request.reference_number?.includes(searchTerm)
  );
  
  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  const approvedRequests = filteredRequests.filter(r => r.status === 'approved');
  const rejectedRequests = filteredRequests.filter(r => r.status === 'rejected');
  
  useEffect(() => {
    const interval = setInterval(() => {
      refetchAdhesionRequests();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetchAdhesionRequests]);

  const handleManualRefresh = () => {
    refetchAdhesionRequests();
  };
  
  if (retryCount > 2) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Problème de connexion aux données</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>Nous rencontrons des difficultés pour récupérer les demandes d'adhésion. Veuillez vérifier votre connexion et les permissions de votre compte.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 w-full max-w-sm">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher par nom, email, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleManualRefresh}
          className="ml-auto"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
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
            onRefresh={refetchAdhesionRequests}
          />
        </TabsContent>
        
        <TabsContent value="approved">
          <AdhesionRequestsTable 
            requests={approvedRequests}
            isLoading={isLoadingAdhesionRequests}
            onRefresh={refetchAdhesionRequests}
          />
        </TabsContent>
        
        <TabsContent value="rejected">
          <AdhesionRequestsTable 
            requests={rejectedRequests}
            isLoading={isLoadingAdhesionRequests}
            onRefresh={refetchAdhesionRequests}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

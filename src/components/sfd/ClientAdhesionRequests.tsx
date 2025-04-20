import React, { useState, useEffect } from 'react';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { AdhesionRequestsTable } from './AdhesionRequestsTable';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';

export function ClientAdhesionRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { toast } = useToast();
  
  const { 
    adhesionRequests, 
    isLoadingAdhesionRequests, 
    refetchAdhesionRequests,
    retryCount
  } = useClientAdhesions();
  
  const typedAdhesionRequests = adhesionRequests as ClientAdhesionRequest[];
  
  const filteredRequests = typedAdhesionRequests.filter(request => 
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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchAdhesionRequests();
      toast({
        title: "Données actualisées",
        description: "Les demandes d'adhésion ont été rafraîchies",
      });
    } catch (error) {
      toast({
        title: "Échec de l'actualisation",
        description: "Impossible de récupérer les demandes. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const isErrorState = false; // Removed retryCount dependency
  
  if (isErrorState) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Problème de connexion aux données</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>
            Nous rencontrons des difficultés pour récupérer les demandes d'adhésion. 
            Cela peut être dû à l'une des raisons suivantes :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Un problème de connexion internet</li>
            <li>Des permissions insuffisantes sur votre compte</li>
            <li>Une maintenance temporaire du serveur</li>
          </ul>
          <p>Veuillez vérifier votre connexion et les permissions de votre compte, puis réessayez.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="mt-2"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Actualisation en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </>
            )}
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
          disabled={isRefreshing}
          className="ml-auto"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Actualisation...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </>
          )}
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
            requests={pendingRequests as any}
            isLoading={isLoadingAdhesionRequests}
          />
        </TabsContent>
        
        <TabsContent value="approved">
          <AdhesionRequestsTable 
            requests={approvedRequests as any}
            isLoading={isLoadingAdhesionRequests}
          />
        </TabsContent>
        
        <TabsContent value="rejected">
          <AdhesionRequestsTable 
            requests={rejectedRequests as any}
            isLoading={isLoadingAdhesionRequests}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  AlertCircle 
} from 'lucide-react';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { AdhesionRequestsTable } from '@/components/sfd/AdhesionRequestsTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader } from '@/components/ui/loader';
import { AdhesionActionDialog } from './AdhesionActionDialog';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function ClientAdhesionRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<ClientAdhesionRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { 
    adhesionRequests, 
    isLoadingAdhesionRequests,
    refetchAdhesionRequests
  } = useClientAdhesions();

  useEffect(() => {
    console.info('Adhesion Requests Component:', {
      requestsCount: adhesionRequests.length,
      requests: adhesionRequests,
      isLoading: isLoadingAdhesionRequests
    });
  }, [adhesionRequests, isLoadingAdhesionRequests]);

  // Filtre les demandes en attente (status: 'pending' ou 'pending_validation')
  const pendingRequests = adhesionRequests.filter(r => 
    (r.status === 'pending' || r.status === 'pending_validation') &&
    (r.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.phone?.includes(searchTerm))
  );
  
  // Filtre les demandes approuvées
  const approvedRequests = adhesionRequests.filter(r => 
    r.status === 'approved' &&
    (r.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.phone?.includes(searchTerm))
  );
  
  // Filtre les demandes rejetées
  const rejectedRequests = adhesionRequests.filter(r => 
    r.status === 'rejected' &&
    (r.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.phone?.includes(searchTerm))
  );

  const handleApprove = (request: ClientAdhesionRequest) => {
    console.log('Approving request:', request);
    setSelectedRequest(request);
    setActionType('approve');
    setNotes('');
    setErrorMessage(null);
  };

  const handleReject = (request: ClientAdhesionRequest) => {
    console.log('Rejecting request:', request);
    setSelectedRequest(request);
    setActionType('reject');
    setNotes('');
    setErrorMessage(null);
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setActionType(null);
    setNotes('');
    setIsProcessing(false);
    setErrorMessage(null);
  };

  const handleConfirmAction = async (notes?: string) => {
    if (!selectedRequest || !user || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      if (actionType === 'approve') {
        console.log(`Confirming ${actionType} action for request:`, selectedRequest.id);
        
        // Utiliser l'Edge Function pour l'approbation
        console.log('Calling approve-adhesion-request with params:', { 
          adhesionId: selectedRequest.id, 
          userId: user.id,
          notes 
        });
        
        const { data, error } = await supabase.functions.invoke('approve-adhesion-request', {
          body: { 
            adhesionId: selectedRequest.id, 
            userId: user.id,
            notes 
          }
        });
        
        if (error) {
          console.error('Edge function error:', error);
          setErrorMessage(error.message || 'Erreur lors de l\'approbation');
          throw new Error(error.message || 'Erreur lors de l\'approbation');
        }
        
        console.log('Edge function response:', data);
        
        toast({
          title: 'Demande approuvée',
          description: 'La demande d\'adhésion a été approuvée avec succès',
        });
      } else if (actionType === 'reject') {
        // Utiliser la fonction du hook pour le rejet
        const { error } = await supabase
          .from('client_adhesion_requests')
          .update({
            status: 'rejected',
            processed_by: user.id,
            processed_at: new Date().toISOString(),
            notes: notes || ''
          })
          .eq('id', selectedRequest.id);
          
        if (error) {
          console.error('Error rejecting request:', error);
          setErrorMessage(error.message || 'Erreur lors du rejet');
          throw new Error(error.message || 'Erreur lors du rejet');
        }
          
        toast({
          title: 'Demande rejetée',
          description: 'La demande d\'adhésion a été rejetée',
        });
      }
      
      // Actualiser la liste après l'action
      await refetchAdhesionRequests();
      handleCloseDialog();
    } catch (error) {
      console.error('Error during confirmation action:', error);
      const errorMsg = error instanceof Error ? error.message : 'Une erreur s\'est produite';
      
      setErrorMessage(errorMsg);
      
      toast({
        title: 'Erreur',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = () => {
    refetchAdhesionRequests();
    setErrorMessage(null);
  };

  if (isLoadingAdhesionRequests) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader size="lg" className="mb-4" />
        <p className="text-gray-500">Chargement des demandes d'adhésion...</p>
      </div>
    );
  }

  if (adhesionRequests.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
        
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Aucune demande d'adhésion</AlertTitle>
          <AlertDescription className="text-amber-700">
            Il n'y a actuellement aucune demande d'adhésion pour cette SFD.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log('Rendering tabs with pendingRequests:', pendingRequests.length);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher par nom, email ou téléphone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

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
            onApprove={handleApprove}
            onReject={handleReject}
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

      <AdhesionActionDialog
        request={selectedRequest}
        isOpen={!!selectedRequest && !!actionType}
        action={actionType}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        notes={notes}
        onNotesChange={setNotes}
        isProcessing={isProcessing}
        errorMessage={errorMessage}
      />
    </div>
  );
}

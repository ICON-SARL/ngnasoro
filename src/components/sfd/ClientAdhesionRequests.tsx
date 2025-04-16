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
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';

export function ClientAdhesionRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<ClientAdhesionRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { 
    adhesionRequests, 
    isLoadingAdhesionRequests,
    refetchAdhesionRequests,
    approveAdhesionRequest,
    rejectAdhesionRequest 
  } = useClientAdhesions();

  useEffect(() => {
    refetchAdhesionRequests();
  }, [refetchAdhesionRequests]);

  const filteredRequests = adhesionRequests.filter(request => 
    request.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.phone?.includes(searchTerm)
  );

  const pendingRequests = filteredRequests.filter(r => r.status === 'pending');
  const approvedRequests = filteredRequests.filter(r => r.status === 'approved');
  const rejectedRequests = filteredRequests.filter(r => r.status === 'rejected');

  const handleRefresh = () => {
    refetchAdhesionRequests();
  };

  const handleOpenActionDialog = (request: ClientAdhesionRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setActionNotes('');
    setShowActionDialog(true);
  };

  const handleCloseActionDialog = () => {
    setShowActionDialog(false);
    setSelectedRequest(null);
    setActionType(null);
    setActionNotes('');
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    
    try {
      const success = await approveAdhesionRequest(selectedRequest.id, actionNotes);
      
      if (success) {
        toast({
          title: "Demande approuvée",
          description: "La demande d'adhésion a été approuvée avec succès.",
        });
      } else {
        throw new Error("Échec de l'approbation");
      }
      
      refetchAdhesionRequests();
      handleCloseActionDialog();
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la demande:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'approbation de la demande.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    setIsProcessing(true);
    
    try {
      const success = await rejectAdhesionRequest(selectedRequest.id, actionNotes);
      
      if (success) {
        toast({
          title: "Demande rejetée",
          description: "La demande d'adhésion a été rejetée.",
        });
      } else {
        throw new Error("Échec du rejet");
      }
      
      refetchAdhesionRequests();
      handleCloseActionDialog();
    } catch (error) {
      console.error('Erreur lors du rejet de la demande:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rejet de la demande.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = () => {
    if (actionType === 'approve') {
      handleApproveRequest();
    } else if (actionType === 'reject') {
      handleRejectRequest();
    }
  };

  if (isLoadingAdhesionRequests) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  if (adhesionRequests.length === 0) {
    return (
      <Alert className="bg-gray-50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Aucune demande d'adhésion</AlertTitle>
        <AlertDescription>
          Il n'y a actuellement aucune demande d'adhésion à traiter.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Rechercher par nom, email ou téléphone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
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
            onApprove={(request) => handleOpenActionDialog(request, 'approve')}
            onReject={(request) => handleOpenActionDialog(request, 'reject')}
          />
        </TabsContent>

        <TabsContent value="approved">
          <AdhesionRequestsTable 
            requests={approvedRequests}
            isLoading={isLoadingAdhesionRequests}
            hideActions
          />
        </TabsContent>

        <TabsContent value="rejected">
          <AdhesionRequestsTable 
            requests={rejectedRequests}
            isLoading={isLoadingAdhesionRequests}
            hideActions
          />
        </TabsContent>
      </Tabs>

      {showActionDialog && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              {actionType === 'approve' ? 'Approuver la demande' : 'Rejeter la demande'}
            </h3>
            <p className="mb-4">
              {actionType === 'approve' 
                ? `Êtes-vous sûr de vouloir approuver la demande de ${selectedRequest.full_name} ?` 
                : `Êtes-vous sûr de vouloir rejeter la demande de ${selectedRequest.full_name} ?`}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {actionType === 'approve' ? 'Notes (optionnel)' : 'Raison du rejet'}
              </label>
              <textarea 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={handleCloseActionDialog}
                disabled={isProcessing}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleConfirmAction}
                disabled={isProcessing || (actionType === 'reject' && !actionNotes)}
                variant={actionType === 'approve' ? 'default' : 'destructive'}
              >
                {isProcessing ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : actionType === 'approve' ? 'Approuver' : 'Rejeter'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

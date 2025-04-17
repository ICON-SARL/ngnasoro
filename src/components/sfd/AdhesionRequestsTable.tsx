
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AdhesionRequest } from '@/hooks/useClientAdhesions';
import { Loader2, CheckCircle, XCircle, Eye, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { useSfdAdhesionRequests } from '@/hooks/useSfdAdhesionRequests';
import { useToast } from '@/hooks/use-toast';

interface AdhesionRequestsTableProps {
  requests: AdhesionRequest[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function AdhesionRequestsTable({ 
  requests, 
  isLoading,
  onRefresh
}: AdhesionRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<AdhesionRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const { processAdhesionRequest, isProcessing } = useSfdAdhesionRequests();
  const { toast } = useToast();

  const handleViewDetails = (request: AdhesionRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleAction = (request: AdhesionRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setNotes('');
    setIsActionDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      const result = await processAdhesionRequest(
        selectedRequest.id,
        actionType,
        notes
      );

      if (result.success) {
        toast({
          title: actionType === 'approve' ? 'Demande approuvée' : 'Demande rejetée',
          description: actionType === 'approve' 
            ? 'Le client a été notifié de l\'approbation de sa demande' 
            : 'Le client a été notifié du rejet de sa demande',
          variant: actionType === 'approve' ? 'default' : 'destructive',
        });
        setIsActionDialogOpen(false);
        
        // Refresh the data
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors du traitement de la demande',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur technique est survenue',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejetée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <p className="text-gray-500">Aucune demande trouvée</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {request.reference_number || request.id.substring(0, 8)}
              </TableCell>
              <TableCell>{request.full_name}</TableCell>
              <TableCell>
                {request.phone || request.email || 'N/A'}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                  {formatDate(request.created_at)}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(request)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  
                  {request.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleAction(request, 'approve')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleAction(request, 'reject')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
            <DialogDescription>
              Demande d'adhésion de {selectedRequest?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Nom complet</p>
                  <p>{selectedRequest.full_name}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Statut</p>
                  <p>{getStatusBadge(selectedRequest.status)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Téléphone</p>
                  <p>{selectedRequest.phone || 'N/A'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{selectedRequest.email || 'N/A'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Profession</p>
                  <p>{selectedRequest.profession || 'N/A'}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Revenu mensuel</p>
                  <p>{selectedRequest.monthly_income 
                      ? `${selectedRequest.monthly_income.toLocaleString()} FCFA` 
                      : 'N/A'}</p>
                </div>
                
                <div className="space-y-1 col-span-2">
                  <p className="text-sm font-medium text-gray-500">Source de revenu</p>
                  <p>{selectedRequest.source_of_income || 'N/A'}</p>
                </div>
                
                <div className="space-y-1 col-span-2">
                  <p className="text-sm font-medium text-gray-500">Adresse</p>
                  <p>{selectedRequest.address || 'N/A'}</p>
                </div>
                
                {selectedRequest.notes && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-sm text-gray-700">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approuver' : 'Rejeter'} la demande
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Confirmer l\'approbation de cette demande d\'adhésion' 
                : 'Veuillez indiquer la raison du rejet de cette demande'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <Textarea
              placeholder={actionType === 'approve' 
                ? 'Notes additionnelles (facultatif)' 
                : 'Raison du rejet...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
              required={actionType === 'reject'}
            />
          </div>
          
          <DialogFooter className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsActionDialogOpen(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmitAction}
              disabled={isProcessing || (actionType === 'reject' && !notes)}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                actionType === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

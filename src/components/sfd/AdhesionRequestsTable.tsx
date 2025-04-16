
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface AdhesionRequest {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  status: string;
  created_at: string;
  sfd_id: string;
  sfd_name?: string;
  notes?: string;
}

interface AdhesionRequestsTableProps {
  requests: AdhesionRequest[];
  isLoading: boolean;
  onStatusChange?: () => void;
}

export const AdhesionRequestsTable: React.FC<AdhesionRequestsTableProps> = ({ 
  requests, 
  isLoading,
  onStatusChange
}) => {
  const [selectedRequest, setSelectedRequest] = useState<AdhesionRequest | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleApproveClick = (request: AdhesionRequest) => {
    setSelectedRequest(request);
    setDialogAction('approve');
    setNotes('');
  };

  const handleRejectClick = (request: AdhesionRequest) => {
    setSelectedRequest(request);
    setDialogAction('reject');
    setNotes('');
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setDialogAction(null);
    setNotes('');
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !user?.id) return;
    
    setIsProcessing(true);
    
    try {
      if (dialogAction === 'approve') {
        // Call the edge function to approve the request
        const { error } = await supabase.functions.invoke('approve-adhesion-request', {
          body: {
            adhesionId: selectedRequest.id,
            notes: notes,
            adminId: user.id
          }
        });
        
        if (error) throw error;
        
        toast({
          title: 'Demande approuvée',
          description: 'La demande d\'adhésion a été approuvée avec succès.',
        });
      } else if (dialogAction === 'reject') {
        // Update the request status to rejected
        const { error } = await supabase
          .from('client_adhesion_requests')
          .update({
            status: 'rejected',
            processed_by: user.id,
            processed_at: new Date().toISOString(),
            notes: notes,
            rejection_reason: notes
          })
          .eq('id', selectedRequest.id);
          
        if (error) throw error;
        
        // Create notification
        await supabase
          .from('admin_notifications')
          .insert({
            title: 'Demande d\'adhésion rejetée',
            message: `Votre demande d'adhésion a été rejetée. Raison: ${notes || 'Non spécifiée'}`,
            type: 'client_adhesion_rejected',
            recipient_id: selectedRequest.user_id,
            sender_id: user.id
          });
          
        toast({
          title: 'Demande rejetée',
          description: 'La demande d\'adhésion a été rejetée.',
        });
      }
      
      // Refresh the data
      if (onStatusChange) {
        onStatusChange();
      }
      
      closeDialog();
    } catch (error) {
      console.error('Error processing adhesion request:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du traitement de la demande.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionButtons = (request: AdhesionRequest) => {
    if (request.status === 'pending') {
      return (
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
            onClick={() => handleApproveClick(request)}
          >
            <CheckCircle className="h-4 w-4 mr-1" /> Approuver
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => handleRejectClick(request)}
          >
            <XCircle className="h-4 w-4 mr-1" /> Rejeter
          </Button>
        </div>
      );
    } else if (request.status === 'approved') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" /> Approuvé
        </span>
      );
    } else if (request.status === 'rejected') {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs flex items-center">
          <XCircle className="h-3 w-3 mr-1" /> Rejeté
        </span>
      );
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg bg-gray-50">
        <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600">Aucune demande d'adhésion trouvée.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Nom complet</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {formatDate(request.created_at)}
                </TableCell>
                <TableCell>
                  {request.full_name}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    {request.email && (
                      <span>{request.email}</span>
                    )}
                    {request.phone && (
                      <span className="text-gray-500">{request.phone}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {getActionButtons(request)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedRequest && !!dialogAction} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve' ? 'Approuver la demande' : 'Rejeter la demande'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve' 
                ? 'Voulez-vous approuver cette demande d\'adhésion ?' 
                : 'Veuillez indiquer la raison du rejet de cette demande.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="py-4">
              <p><strong>Demandeur:</strong> {selectedRequest.full_name}</p>
              {selectedRequest.email && <p><strong>Email:</strong> {selectedRequest.email}</p>}
              {selectedRequest.phone && <p><strong>Téléphone:</strong> {selectedRequest.phone}</p>}
              <p><strong>Date de la demande:</strong> {formatDate(selectedRequest.created_at)}</p>
            </div>
          )}
          
          <div className="mt-2">
            <Textarea
              placeholder={dialogAction === 'approve' 
                ? 'Notes supplémentaires (optionnel)' 
                : 'Raison du rejet (sera communiquée au client)'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              required={dialogAction === 'reject'}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isProcessing}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirmAction} 
              disabled={isProcessing || (dialogAction === 'reject' && !notes)}
              variant={dialogAction === 'approve' ? 'default' : 'destructive'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : dialogAction === 'approve' ? (
                'Approuver'
              ) : (
                'Rejeter'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

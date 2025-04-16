
import React, { useState } from 'react';
import { useClientAdhesions, AdhesionRequest } from '@/hooks/useClientAdhesions';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/utils/formatters';
import { useSfdAdhesionRequests } from '@/hooks/useSfdAdhesionRequests';

export function ClientAdhesionRequests() {
  const { adhesionRequests, isLoadingAdhesionRequests, refetchAdhesionRequests } = useClientAdhesions();
  const { processAdhesionRequest, isProcessing } = useSfdAdhesionRequests();
  
  const [selectedRequest, setSelectedRequest] = useState<AdhesionRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');
  
  const handleViewRequest = (request: AdhesionRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
    setRejectionNotes('');
  };
  
  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    const result = await processAdhesionRequest(selectedRequest.id, 'approve');
    
    if (result.success) {
      setIsDialogOpen(false);
      refetchAdhesionRequests();
    }
  };
  
  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    
    const result = await processAdhesionRequest(
      selectedRequest.id, 
      'reject', 
      rejectionNotes
    );
    
    if (result.success) {
      setIsDialogOpen(false);
      refetchAdhesionRequests();
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-50 text-amber-600 border-amber-200">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-50 text-green-600 border-green-200">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-600 border-red-200">Rejetée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  if (isLoadingAdhesionRequests) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Chargement des demandes d'adhésion...</p>
      </div>
    );
  }
  
  if (adhesionRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">Aucune demande d'adhésion</h3>
        <p className="text-muted-foreground">
          Vous n'avez pas encore reçu de demande d'adhésion.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adhesionRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.full_name}</TableCell>
              <TableCell>
                {request.phone && <div>{request.phone}</div>}
                {request.email && <div className="text-gray-500 text-xs">{request.email}</div>}
              </TableCell>
              <TableCell>{formatDate(request.created_at)}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleViewRequest(request)}
                >
                  {request.status === 'pending' ? 'Traiter' : 'Détails'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {selectedRequest && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedRequest.status === 'pending' 
                  ? 'Traiter la demande d\'adhésion' 
                  : 'Détails de la demande d\'adhésion'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Nom complet</p>
                  <p>{selectedRequest.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date de demande</p>
                  <p>{formatDate(selectedRequest.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Téléphone</p>
                  <p>{selectedRequest.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p>{selectedRequest.email || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Adresse</p>
                  <p>{selectedRequest.address || '-'}</p>
                </div>
              </div>
              
              {selectedRequest.status === 'rejected' && selectedRequest.notes && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                  <p className="text-sm font-medium text-red-700">Raison du rejet:</p>
                  <p className="text-sm text-red-600">{selectedRequest.notes}</p>
                </div>
              )}
              
              {selectedRequest.status === 'pending' && (
                <div>
                  <Textarea
                    placeholder="Notes ou raison de rejet (optionnel)"
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
            
            {selectedRequest.status === 'pending' && (
              <DialogFooter className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleRejectRequest}
                  disabled={isProcessing}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Rejeter
                </Button>
                <Button 
                  onClick={handleApproveRequest}
                  disabled={isProcessing}
                  className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approuver
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

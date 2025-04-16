
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useSfdAdhesionRequests } from '@/hooks/useSfdAdhesionRequests';

interface AdhesionRequestsTableProps {
  requests: any[];
  isLoading: boolean;
  onStatusChange?: () => void;
}

export const AdhesionRequestsTable: React.FC<AdhesionRequestsTableProps> = ({
  requests,
  isLoading,
  onStatusChange
}) => {
  const { processAdhesionRequest, isProcessing } = useSfdAdhesionRequests();
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  
  const handleOpenDialog = (request: any, type: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setDialogType(type);
    setNotes('');
  };
  
  const handleCloseDialog = () => {
    setSelectedRequest(null);
    setDialogType(null);
    setNotes('');
  };
  
  const handleProcess = async () => {
    if (!selectedRequest || !dialogType) return;
    
    const result = await processAdhesionRequest(
      selectedRequest.id,
      dialogType,
      notes || undefined
    );
    
    if (result.success && onStatusChange) {
      handleCloseDialog();
      onStatusChange();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader size="lg" />
        <p className="mt-4 text-muted-foreground">Chargement des demandes...</p>
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Aucune demande</h3>
        <p className="mt-2 text-muted-foreground">
          Il n'y a pas de demandes d'adhésion correspondant à ces critères.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-md border overflow-hidden">
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
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.full_name}</TableCell>
                <TableCell>
                  {request.phone || 'N/A'}
                  {request.email && <div className="text-xs text-muted-foreground">{request.email}</div>}
                </TableCell>
                <TableCell>{formatDate(request.created_at)}</TableCell>
                <TableCell>
                  {request.status === 'pending' && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                      En attente
                    </span>
                  )}
                  {request.status === 'approved' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Approuvée
                    </span>
                  )}
                  {request.status === 'rejected' && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                      Rejetée
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {request.status === 'pending' && (
                    <div className="flex space-x-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleOpenDialog(request, 'approve')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleOpenDialog(request, 'reject')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                  {request.status !== 'pending' && (
                    <span className="text-sm text-muted-foreground">
                      {request.processed_at ? `Traitée le ${formatDate(request.processed_at)}` : 'Traitée'}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={!!selectedRequest && !!dialogType} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'approve' ? 'Approuver la demande' : 'Rejeter la demande'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'approve' ? (
                'Êtes-vous sûr de vouloir approuver cette demande ? Un compte client sera créé pour cet utilisateur.'
              ) : (
                'Êtes-vous sûr de vouloir rejeter cette demande ? Veuillez fournir une raison.'
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">
              {dialogType === 'approve' ? 'Notes (optionnel)' : 'Raison du rejet'}
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={dialogType === 'approve' ? 'Notes internes' : 'Raison du rejet'}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button
              onClick={handleProcess}
              disabled={isProcessing || (dialogType === 'reject' && !notes)}
              variant={dialogType === 'approve' ? 'default' : 'destructive'}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : dialogType === 'approve' ? (
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

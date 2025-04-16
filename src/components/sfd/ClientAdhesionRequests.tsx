
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Eye, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { formatDate } from '@/utils/formatters';
import { Loader } from '@/components/ui/loader';

export const ClientAdhesionRequests: React.FC = () => {
  const { 
    adhesionRequests, 
    isLoadingAdhesionRequests, 
    refetchAdhesionRequests,
    approveAdhesionRequest,
    rejectAdhesionRequest
  } = useClientAdhesions();

  const [selectedRequest, setSelectedRequest] = useState<ClientAdhesionRequest | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleViewDetails = (request: ClientAdhesionRequest) => {
    setSelectedRequest(request);
    setViewDetailsOpen(true);
  };

  const handleApproveRequest = (request: ClientAdhesionRequest) => {
    setSelectedRequest(request);
    setApproveDialogOpen(true);
  };

  const handleRejectRequest = (request: ClientAdhesionRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const confirmApproval = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      await approveAdhesionRequest(selectedRequest.id, notes);
      setApproveDialogOpen(false);
      setNotes('');
      refetchAdhesionRequests();
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmRejection = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      await rejectAdhesionRequest(selectedRequest.id, notes);
      setRejectDialogOpen(false);
      setNotes('');
      refetchAdhesionRequests();
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejetée</Badge>;
      default:
        return null;
    }
  };

  const pendingRequests = adhesionRequests.filter(req => req.status === 'pending');

  if (isLoadingAdhesionRequests) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
        <span className="ml-3 text-gray-600">Chargement des demandes...</span>
      </div>
    );
  }

  if (adhesionRequests.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune demande d'adhésion</h3>
        <p className="text-gray-600 mb-4">
          Il n'y a actuellement aucune demande d'adhésion à traiter.
        </p>
        <Button onClick={() => refetchAdhesionRequests()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>
    );
  }

  return (
    <div>
      {pendingRequests.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <p className="text-yellow-800">
            Vous avez <strong>{pendingRequests.length}</strong> demande(s) en attente de traitement
          </p>
        </div>
      )}

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="hidden md:table-cell">Profession</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adhesionRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.full_name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {request.phone && <div>{request.phone}</div>}
                    {request.email && <div className="text-gray-600 text-xs">{request.email}</div>}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{request.profession || '-'}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(request.created_at)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewDetails(request)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Détails</span>
                    </Button>

                    {request.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleApproveRequest(request)}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRejectRequest(request)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogue de détails */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de la demande d'adhésion</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Nom complet</h4>
                  <p>{selectedRequest.full_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                  <p>{getStatusBadge(selectedRequest.status)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Téléphone</h4>
                  <p>{selectedRequest.phone || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p>{selectedRequest.email || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Adresse</h4>
                  <p>{selectedRequest.address || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Profession</h4>
                  <p>{selectedRequest.profession || '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Revenu mensuel</h4>
                  <p>{selectedRequest.monthly_income ? `${selectedRequest.monthly_income} FCFA` : '-'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Source de revenu</h4>
                  <p>{selectedRequest.source_of_income || '-'}</p>
                </div>
              </div>

              {(selectedRequest.notes || selectedRequest.rejection_reason) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded">
                    {selectedRequest.notes || selectedRequest.rejection_reason || '-'}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <h4 className="text-sm font-medium text-gray-500">Dates</h4>
                <div className="text-sm mt-1">
                  <p><span className="font-medium">Créée le:</span> {formatDate(selectedRequest.created_at)}</p>
                  {selectedRequest.processed_at && (
                    <p><span className="font-medium">Traitée le:</span> {formatDate(selectedRequest.processed_at)}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue d'approbation */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approuver cette demande?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point d'approuver la demande d'adhésion de <strong>{selectedRequest?.full_name}</strong>.
              Cela créera un compte client pour cet utilisateur. Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <Textarea
              placeholder="Ajouter des notes concernant cette approbation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmApproval();
              }}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader size="sm" className="mr-2" /> Traitement...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> Approuver
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogue de rejet */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter cette demande?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de rejeter la demande d'adhésion de <strong>{selectedRequest?.full_name}</strong>.
              Veuillez indiquer la raison du rejet. Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison du rejet <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Veuillez expliquer la raison du rejet..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmRejection();
              }}
              disabled={isProcessing || !notes.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader size="sm" className="mr-2" /> Traitement...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" /> Rejeter
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

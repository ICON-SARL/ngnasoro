
import React, { useState } from 'react';
import { useMerefFundRequests, MerefFundRequest } from '@/hooks/useMerefFundRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, AlertCircle, CircleDollarSign } from 'lucide-react';
import { formatDateToLocale } from '@/utils/dateUtils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export function MerefFundRequestsManager() {
  const { 
    fundRequests, 
    isLoading, 
    approveFundRequest, 
    rejectFundRequest, 
    executeFundTransfer 
  } = useMerefFundRequests();
  
  const [selectedRequest, setSelectedRequest] = useState<MerefFundRequest | null>(null);
  const [dialogType, setDialogType] = useState<'view' | 'approve' | 'reject' | 'transfer'>('view');
  const [comments, setComments] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredRequests = fundRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      request.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.amount.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejetée</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Complétée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleViewRequest = (request: MerefFundRequest) => {
    setSelectedRequest(request);
    setDialogType('view');
  };
  
  const handleApproveRequest = (request: MerefFundRequest) => {
    setSelectedRequest(request);
    setDialogType('approve');
    setComments('');
  };
  
  const handleRejectRequest = (request: MerefFundRequest) => {
    setSelectedRequest(request);
    setDialogType('reject');
    setComments('');
  };
  
  const handleTransferFunds = (request: MerefFundRequest) => {
    setSelectedRequest(request);
    setDialogType('transfer');
  };
  
  const confirmAction = () => {
    if (!selectedRequest) return;
    
    if (dialogType === 'approve') {
      approveFundRequest.mutate({ 
        requestId: selectedRequest.id, 
        comments: comments.trim() !== '' ? comments : undefined 
      });
    } else if (dialogType === 'reject') {
      rejectFundRequest.mutate({ 
        requestId: selectedRequest.id, 
        comments: comments.trim() !== '' ? comments : undefined 
      });
    } else if (dialogType === 'transfer') {
      executeFundTransfer.mutate(selectedRequest.id);
    }
    
    setSelectedRequest(null);
  };
  
  const getDialogTitle = () => {
    switch (dialogType) {
      case 'view': return 'Détails de la demande';
      case 'approve': return 'Approuver la demande';
      case 'reject': return 'Rejeter la demande';
      case 'transfer': return 'Transférer les fonds';
      default: return 'Demande de financement';
    }
  };
  
  const getDialogDescription = () => {
    switch (dialogType) {
      case 'view': return 'Informations détaillées sur la demande de financement';
      case 'approve': return 'Confirmer l\'approbation de cette demande de financement';
      case 'reject': return 'Confirmer le rejet de cette demande de financement';
      case 'transfer': return 'Transférer les fonds sur le compte de la SFD';
      default: return '';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Demandes de Financement SFD</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les demandes de financement soumises par les SFDs
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvées</SelectItem>
              <SelectItem value="rejected">Rejetées</SelectItem>
              <SelectItem value="completed">Complétées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des demandes de financement</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Aucune demande de financement trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SFD</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Objet</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>SFD ID: {request.sfd_id.substring(0, 8)}...</TableCell>
                      <TableCell>{formatDateToLocale(request.created_at)}</TableCell>
                      <TableCell>{request.amount.toLocaleString()} FCFA</TableCell>
                      <TableCell className="max-w-xs truncate">{request.purpose}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewRequest(request)}
                          >
                            Détails
                          </Button>
                          
                          {request.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleApproveRequest(request)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approuver
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleRejectRequest(request)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeter
                              </Button>
                            </>
                          )}
                          
                          {request.status === 'approved' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => handleTransferFunds(request)}
                            >
                              <CircleDollarSign className="h-4 w-4 mr-1" />
                              Transférer
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog for fund request actions */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{getDialogTitle()}</DialogTitle>
              <DialogDescription>
                {getDialogDescription()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">SFD:</span>
                <span>{selectedRequest.sfd_id}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Statut:</span>
                <span>{getStatusBadge(selectedRequest.status)}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Montant:</span>
                <span className="font-medium">{selectedRequest.amount.toLocaleString()} FCFA</span>
              </div>
              
              <div className="border-b pb-2">
                <span className="text-gray-500">Objet:</span>
                <p className="mt-1">{selectedRequest.purpose}</p>
              </div>
              
              <div className="border-b pb-2">
                <span className="text-gray-500">Justification:</span>
                <p className="mt-1 text-sm whitespace-pre-line">{selectedRequest.justification}</p>
              </div>
              
              {(dialogType === 'approve' || dialogType === 'reject') && (
                <div>
                  <span className="text-gray-500">Commentaires:</span>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={`Ajouter un commentaire sur cette ${dialogType === 'approve' ? 'approbation' : 'rejet'}...`}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              )}
              
              {dialogType === 'transfer' && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-blue-800 text-sm">
                    Vous êtes sur le point de transférer <strong>{selectedRequest.amount.toLocaleString()} FCFA</strong> sur le compte d'opération de la SFD.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedRequest(null)}
              >
                Annuler
              </Button>
              
              {dialogType !== 'view' && (
                <Button 
                  onClick={confirmAction}
                  className={
                    dialogType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    dialogType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }
                >
                  {dialogType === 'approve' && 'Approuver'}
                  {dialogType === 'reject' && 'Rejeter'}
                  {dialogType === 'transfer' && 'Confirmer le transfert'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Check, X, ArrowUpDown, Eye, CreditCard } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useMerefLoanRequests, MerefLoanRequest } from '@/hooks/useMerefLoanRequests';

export function MerefLoanRequestsList() {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<MerefLoanRequest | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | 'disburse' | null>(null);
  const [comments, setComments] = useState('');
  
  const { 
    requests, 
    isLoading, 
    filters, 
    updateFilter, 
    resetFilters,
    approveRequest, 
    rejectRequest,
    disburseRequest
  } = useMerefLoanRequests();

  const handleViewDetails = (requestId: string) => {
    navigate(`/meref-loan-requests/${requestId}`);
  };

  const openConfirmDialog = (request: MerefLoanRequest, action: 'approve' | 'reject' | 'disburse') => {
    setSelectedRequest(request);
    setConfirmAction(action);
    setComments('');
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedRequest || !confirmAction) return;
    
    switch (confirmAction) {
      case 'approve':
        approveRequest(selectedRequest.id, comments);
        break;
      case 'reject':
        rejectRequest(selectedRequest.id, comments);
        break;
      case 'disburse':
        disburseRequest(selectedRequest.id);
        break;
    }
    
    setConfirmDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Brouillon</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Soumise</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejetée</Badge>;
      case 'disbursed':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Décaissée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">Demandes de Prêt MEREF</CardTitle>
        <CardDescription>
          Gestion des demandes de prêt soumises par les SFD
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select 
              value={filters.status} 
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="submitted">Soumise</SelectItem>
                <SelectItem value="approved">Approuvée</SelectItem>
                <SelectItem value="rejected">Rejetée</SelectItem>
                <SelectItem value="disbursed">Décaissée</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              
              <Button variant="outline">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Trier
              </Button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>SFD</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Objet</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.client_name}</TableCell>
                      <TableCell>{request.sfd_name}</TableCell>
                      <TableCell>{formatCurrency(request.amount)}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={request.purpose}>
                        {request.purpose}
                      </TableCell>
                      <TableCell>{request.duration_months} mois</TableCell>
                      <TableCell>{formatDate(request.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewDetails(request.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Voir détails</span>
                          </Button>
                          
                          {request.status === 'submitted' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => openConfirmDialog(request, 'approve')}
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Approuver</span>
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openConfirmDialog(request, 'reject')}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Rejeter</span>
                              </Button>
                            </>
                          )}
                          
                          {request.status === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => openConfirmDialog(request, 'disburse')}
                            >
                              <CreditCard className="h-4 w-4" />
                              <span className="sr-only">Décaisser</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Aucune demande de prêt trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'approve' && "Approuver la demande de prêt"}
              {confirmAction === 'reject' && "Rejeter la demande de prêt"}
              {confirmAction === 'disburse' && "Décaisser le prêt"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'approve' && "Vous êtes sur le point d'approuver cette demande de prêt."}
              {confirmAction === 'reject' && "Vous êtes sur le point de rejeter cette demande de prêt."}
              {confirmAction === 'disburse' && "Vous êtes sur le point de décaisser ce prêt. Le montant sera crédité au compte du client."}
              
              {selectedRequest && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p><strong>Client:</strong> {selectedRequest.client_name}</p>
                  <p><strong>SFD:</strong> {selectedRequest.sfd_name}</p>
                  <p><strong>Montant:</strong> {formatCurrency(selectedRequest.amount)}</p>
                  <p><strong>Durée:</strong> {selectedRequest.duration_months} mois</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {(confirmAction === 'approve' || confirmAction === 'reject') && (
            <Textarea
              placeholder="Commentaires (facultatif)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[100px]"
            />
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant={confirmAction === 'reject' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
            >
              {confirmAction === 'approve' && "Approuver"}
              {confirmAction === 'reject' && "Rejeter"}
              {confirmAction === 'disburse' && "Décaisser"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

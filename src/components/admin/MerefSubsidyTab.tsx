
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, X, Search, ArrowUpDown, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useMerefSubsidyRequests } from '@/hooks/useMerefSubsidyRequests';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function MerefSubsidyTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  
  const { 
    requests, 
    isLoading, 
    approveRequest, 
    rejectRequest 
  } = useMerefSubsidyRequests();

  // Filtrer les demandes en fonction du terme de recherche
  const filteredRequests = requests.filter(request => 
    request.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.sfd_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (requestId: string) => {
    approveRequest.mutate(requestId);
    setConfirmDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleReject = (requestId: string) => {
    rejectRequest.mutate(requestId);
    setConfirmDialogOpen(false);
    setSelectedRequest(null);
  };

  const confirmApprove = (request: any) => {
    setSelectedRequest(request);
    setConfirmAction('approve');
    setConfirmDialogOpen(true);
  };

  const confirmReject = (request: any) => {
    setSelectedRequest(request);
    setConfirmAction('reject');
    setConfirmDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Demandes de Crédit</h2>
          <p className="text-muted-foreground">
            Gérez et approuvez les demandes de prêt des SFD
          </p>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <ArrowUpDown className="h-4 w-4" />
              Trier
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              Filtrer par score
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>SFD</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Objet</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.reference}</TableCell>
                      <TableCell>{request.sfd_name}</TableCell>
                      <TableCell>{formatCurrency(request.amount)}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={request.purpose}>
                        {request.purpose}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={`
                            ${request.score >= 80 ? 'bg-blue-100 text-blue-600' : 
                              request.score >= 60 ? 'bg-green-100 text-green-600' : 
                              request.score >= 40 ? 'bg-yellow-100 text-yellow-600' : 
                              'bg-red-100 text-red-600'}
                            font-medium rounded-full py-0.5 px-3
                          `}
                        >
                          Score: {request.score}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(request.created_at)}</TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            En attente
                          </Badge>
                        )}
                        {request.status === 'approved' && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Approuvée
                          </Badge>
                        )}
                        {request.status === 'rejected' && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            Rejetée
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => confirmApprove(request)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => confirmReject(request)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </div>
                        )}
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
              {confirmAction === 'approve' ? 'Approuver la demande' : 'Rejeter la demande'}
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir {confirmAction === 'approve' ? 'approuver' : 'rejeter'} cette demande ?
              {selectedRequest && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p><strong>SFD:</strong> {selectedRequest.sfd_name}</p>
                  <p><strong>Montant:</strong> {formatCurrency(selectedRequest.amount)}</p>
                  <p><strong>Référence:</strong> {selectedRequest.reference}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant={confirmAction === 'approve' ? 'default' : 'destructive'}
              onClick={() => confirmAction === 'approve' 
                ? handleApprove(selectedRequest?.id) 
                : handleReject(selectedRequest?.id)}
            >
              {confirmAction === 'approve' ? 'Approuver' : 'Rejeter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

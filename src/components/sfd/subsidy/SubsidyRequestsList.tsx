
import React, { useState } from 'react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, AlertTriangle, FileText, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const SubsidyRequestsList: React.FC = () => {
  const { user } = useAuth();
  const { subsidyRequests, isLoading, refetch } = useSubsidyRequests({
    sfdId: user?.app_metadata?.sfd_id
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  const filteredRequests = subsidyRequests.filter(req => 
    req.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800">En cours d'examen</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejetée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-gray-100">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-blue-100">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-100">Haute</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-100">Urgente</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  
  React.useEffect(() => {
    // Refetch data when component mounts
    refetch();
  }, [refetch]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredRequests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Région</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{formatDate(request.created_at)}</TableCell>
                  <TableCell className="font-medium">{formatAmount(request.amount)} FCFA</TableCell>
                  <TableCell>{request.purpose}</TableCell>
                  <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                  <TableCell>{request.region || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getStatusBadge(request.status)}
                      {request.alert_triggered && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10 border rounded-md bg-gray-50">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">Aucune demande trouvée</h3>
            <p className="text-muted-foreground mt-1">
              Vous n'avez pas encore fait de demande de subvention.
            </p>
          </div>
        )}
      </div>
      
      {/* Dialogue de détails */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Détails de la demande</DialogTitle>
              <DialogDescription>
                Informations sur votre demande de prêt MEREF
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{selectedRequest.purpose}</h3>
                {getStatusBadge(selectedRequest.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date de demande</p>
                  <p className="font-medium">{formatDate(selectedRequest.created_at)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Montant demandé</p>
                  <p className="font-medium">{formatAmount(selectedRequest.amount)} FCFA</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Priorité</p>
                  <p className="font-medium">
                    {selectedRequest.priority === 'low' && 'Basse'}
                    {selectedRequest.priority === 'normal' && 'Normale'}
                    {selectedRequest.priority === 'high' && 'Haute'}
                    {selectedRequest.priority === 'urgent' && 'Urgente'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Région</p>
                  <p className="font-medium">{selectedRequest.region || '-'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Justification</p>
                <p className="text-sm mt-1 border p-2 rounded bg-gray-50">{selectedRequest.justification}</p>
              </div>
              
              {selectedRequest.expected_impact && (
                <div>
                  <p className="text-sm text-muted-foreground">Impact attendu</p>
                  <p className="text-sm mt-1 border p-2 rounded bg-gray-50">{selectedRequest.expected_impact}</p>
                </div>
              )}
              
              {selectedRequest.decision_comments && (
                <div>
                  <p className="text-sm text-muted-foreground">Commentaires de décision</p>
                  <p className="text-sm mt-1 border p-2 rounded bg-gray-50">{selectedRequest.decision_comments}</p>
                </div>
              )}
              
              {(selectedRequest.status === 'approved' || selectedRequest.status === 'rejected') && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                  {selectedRequest.status === 'approved' ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Demande approuvée</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedRequest.reviewed_at ? `Le ${formatDate(selectedRequest.reviewed_at)}` : ''}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium">Demande rejetée</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedRequest.reviewed_at ? `Le ${formatDate(selectedRequest.reviewed_at)}` : ''}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

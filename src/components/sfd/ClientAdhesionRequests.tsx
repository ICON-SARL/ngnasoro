import { useState } from 'react';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  Search,
  Clock,
  RefreshCw
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';

export function ClientAdhesionRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<ClientAdhesionRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [processingNotes, setProcessingNotes] = useState('');
  
  const { activeSfdId } = useSfdDataAccess();
  const { 
    adhesionRequests, 
    isLoadingAdhesionRequests, 
    approveAdhesionRequest, 
    rejectAdhesionRequest,
    refetchAdhesionRequests
  } = useClientAdhesions();

  const filteredRequests = adhesionRequests.filter(request => 
    request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (request.email && request.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (request.phone && request.phone.includes(searchTerm))
  );

  const pendingRequests = filteredRequests.filter(request => request.status === 'pending');
  const approvedRequests = filteredRequests.filter(request => request.status === 'approved');
  const rejectedRequests = filteredRequests.filter(request => request.status === 'rejected');

  const handleViewRequest = (request: ClientAdhesionRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
    setProcessingNotes(request.notes || '');
  };

  const handleApproveRequest = () => {
    if (!selectedRequest) return;
    
    approveAdhesionRequest(selectedRequest.id, processingNotes)
      .then(success => {
        if (success) {
          setIsViewDialogOpen(false);
          setProcessingNotes('');
        }
      });
  };

  const handleRejectRequest = () => {
    if (!selectedRequest) return;
    
    rejectAdhesionRequest(selectedRequest.id, processingNotes)
      .then(success => {
        if (success) {
          setIsViewDialogOpen(false);
          setProcessingNotes('');
        }
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-50 text-green-700">Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700">Rejetée</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Demandes d'adhésion client</span>
          <Button variant="outline" size="sm" onClick={() => refetchAdhesionRequests()} className="h-8">
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualiser
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher par nom, email ou téléphone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending" className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                En attente <Badge variant="outline" className="ml-2">{pendingRequests.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Approuvées <Badge variant="outline" className="ml-2">{approvedRequests.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center">
                <XCircle className="h-4 w-4 mr-1" />
                Rejetées <Badge variant="outline" className="ml-2">{rejectedRequests.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <RequestsTable 
                requests={pendingRequests} 
                onViewRequest={handleViewRequest}
                isLoading={isLoadingAdhesionRequests}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>

            <TabsContent value="approved">
              <RequestsTable 
                requests={approvedRequests} 
                onViewRequest={handleViewRequest}
                isLoading={isLoadingAdhesionRequests}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>

            <TabsContent value="rejected">
              <RequestsTable 
                requests={rejectedRequests} 
                onViewRequest={handleViewRequest}
                isLoading={isLoadingAdhesionRequests}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
          </Tabs>

          {selectedRequest && (
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Détails de la demande d'adhésion</DialogTitle>
                  <DialogDescription>
                    Demande créée le {formatDate(selectedRequest.created_at)}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-medium mb-2">Informations personnelles</h3>
                    
                    <div>
                      <div className="text-sm font-medium">Nom complet</div>
                      <div>{selectedRequest.full_name}</div>
                    </div>
                    
                    {selectedRequest.email && (
                      <div>
                        <div className="text-sm font-medium">Email</div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{selectedRequest.email}</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedRequest.phone && (
                      <div>
                        <div className="text-sm font-medium">Téléphone</div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{selectedRequest.phone}</span>
                        </div>
                      </div>
                    )}

                    {selectedRequest.address && (
                      <div>
                        <div className="text-sm font-medium">Adresse</div>
                        <div>{selectedRequest.address}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium mb-2">Informations de demande</h3>
                    
                    <div>
                      <div className="text-sm font-medium">Statut</div>
                      <div>{getStatusBadge(selectedRequest.status)}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium">Date de création</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{formatDate(selectedRequest.created_at)}</span>
                      </div>
                    </div>
                    
                    {selectedRequest.id_type && selectedRequest.id_number && (
                      <div>
                        <div className="text-sm font-medium">Pièce d'identité</div>
                        <div>
                          {selectedRequest.id_type}: {selectedRequest.id_number}
                        </div>
                      </div>
                    )}
                    
                    {selectedRequest.processed_at && (
                      <div>
                        <div className="text-sm font-medium">
                          Date de {selectedRequest.status === 'approved' ? 'validation' : 'rejet'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{formatDate(selectedRequest.processed_at)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedRequest.status === 'pending' && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="notes">Notes de traitement</Label>
                      <Textarea
                        id="notes"
                        placeholder="Ajoutez des notes sur cette demande..."
                        value={processingNotes}
                        onChange={(e) => setProcessingNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {selectedRequest.notes && selectedRequest.status !== 'pending' && (
                  <div className="mt-4">
                    <Label htmlFor="existing-notes">Notes</Label>
                    <p className="text-sm text-muted-foreground p-2 border rounded-md">
                      {selectedRequest.notes}
                    </p>
                  </div>
                )}
                
                <DialogFooter>
                  {selectedRequest.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={handleRejectRequest}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        disabled={rejectAdhesionRequest.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                      <Button 
                        onClick={handleApproveRequest}
                        className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                        disabled={approveAdhesionRequest.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                    </>
                  )}
                  {selectedRequest.status !== 'pending' && (
                    <Button onClick={() => setIsViewDialogOpen(false)}>
                      Fermer
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface RequestsTableProps {
  requests: ClientAdhesionRequest[];
  onViewRequest: (request: ClientAdhesionRequest) => void;
  isLoading: boolean;
  getStatusBadge: (status: string) => React.ReactNode;
}

function RequestsTable({ requests, onViewRequest, isLoading, getStatusBadge }: RequestsTableProps) {
  if (isLoading) {
    return <div className="text-center py-8">Chargement des demandes...</div>;
  }
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune demande trouvée dans cette catégorie.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom complet</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Date de création</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">{request.full_name}</TableCell>
            <TableCell>
              <div className="flex flex-col space-y-1">
                {request.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-3 w-3 mr-1 text-gray-500" />
                    <span>{request.phone}</span>
                  </div>
                )}
                {request.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-3 w-3 mr-1 text-gray-500" />
                    <span>{request.email}</span>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{formatDate(request.created_at)}</TableCell>
            <TableCell>{getStatusBadge(request.status)}</TableCell>
            <TableCell className="text-right">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewRequest(request)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Détails
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

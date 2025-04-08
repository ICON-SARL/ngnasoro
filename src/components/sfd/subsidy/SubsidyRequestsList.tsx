
import React, { useState, useEffect } from 'react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, AlertTriangle, FileText, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SubsidyRequestDetailView } from './SubsidyRequestDetailView';

export const SubsidyRequestsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subsidyRequests, isLoading, refetch } = useSubsidyRequests({
    sfdId: user?.app_metadata?.sfd_id
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

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
  
  useEffect(() => {
    // Refetch data when component mounts
    refetch();
  }, [refetch]);

  const handleViewDetails = (requestId: string) => {
    navigate(`/sfd-subsidy-requests/${requestId}`);
  };

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
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            >
              <FileText className="h-4 w-4" />
              {viewMode === 'table' ? 'Vue cartes' : 'Vue tableau'}
            </Button>
            
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filtres
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredRequests.length > 0 ? (
          viewMode === 'table' ? (
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
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(request.id)}
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
            <>
              <div className="mb-4">
                <h2 className="text-2xl font-bold">Demandes de Subvention</h2>
                <p className="text-muted-foreground">Demandes en attente de décision</p>
              </div>
              
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">{request.purpose}</h3>
                          <p className="text-xl font-semibold">{formatAmount(request.amount)} FCFA</p>
                        </div>
                        
                        <Button 
                          variant="outline"
                          onClick={() => handleViewDetails(request.id)}
                        >
                          Détails
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )
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
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails de la demande de subvention</DialogTitle>
              <DialogDescription>
                Informations détaillées sur la demande de subvention
              </DialogDescription>
            </DialogHeader>
            
            <SubsidyRequestDetailView request={selectedRequest} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

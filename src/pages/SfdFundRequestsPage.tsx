
import React, { useState, useEffect } from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { MerefFundRequestForm } from '@/components/sfd/MerefFundRequestForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMerefFundRequests, MerefFundRequest } from '@/hooks/useMerefFundRequests';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, FileText, RefreshCw } from 'lucide-react';
import { formatDateToLocale } from '@/utils/dateUtils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const SfdFundRequestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('list');
  const [selectedRequest, setSelectedRequest] = useState<MerefFundRequest | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fundRequests, isLoading, refetch } = useMerefFundRequests();
  
  // Rafraîchir automatiquement les données au chargement de la page
  useEffect(() => {
    refetch();
  }, [refetch]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: 'Données actualisées',
        description: 'La liste des demandes a été mise à jour',
      });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rafraîchir les données',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
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
  
  const handleViewDetails = (request: MerefFundRequest) => {
    setSelectedRequest(request);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Demandes de Financement MEREF</h2>
            <p className="text-muted-foreground">
              Gérez vos demandes de financement auprès du MEREF
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualisation...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </>
              )}
            </Button>
            <Button onClick={() => setActiveTab('new')}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Demande
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="list">Mes Demandes</TabsTrigger>
            <TabsTrigger value="new">Nouvelle Demande</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Historique des demandes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading || isRefreshing ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : fundRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Aucune demande de financement trouvée</p>
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab('new')}>
                      Créer une nouvelle demande
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Objet</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fundRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{formatDateToLocale(request.created_at)}</TableCell>
                            <TableCell>{request.amount.toLocaleString()} FCFA</TableCell>
                            <TableCell className="max-w-xs truncate">{request.purpose}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewDetails(request)}
                              >
                                Détails
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="new">
            <MerefFundRequestForm />
          </TabsContent>
        </Tabs>
        
        {/* Request Details Dialog */}
        {selectedRequest && (
          <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Détails de la demande</DialogTitle>
                <DialogDescription>
                  Demande de financement du {formatDateToLocale(selectedRequest.created_at)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
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
                
                {selectedRequest.comments && (
                  <div className="border-b pb-2">
                    <span className="text-gray-500">Commentaires MEREF:</span>
                    <p className="mt-1 text-sm whitespace-pre-line">{selectedRequest.comments}</p>
                  </div>
                )}
                
                {selectedRequest.approved_at && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">
                      {selectedRequest.status === 'approved' || selectedRequest.status === 'completed' 
                        ? 'Approuvée le:' 
                        : 'Rejetée le:'}
                    </span>
                    <span>{formatDateToLocale(selectedRequest.approved_at)}</span>
                  </div>
                )}
                
                {selectedRequest.credited_at && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Fonds transférés le:</span>
                    <span>{formatDateToLocale(selectedRequest.credited_at)}</span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default SfdFundRequestsPage;


import React, { useState } from 'react';
import { useSfdClients } from '@/hooks/useSfdClients';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';
import { 
  Check, 
  X, 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ClientRequestList = () => {
  const { clients, isLoading, validateClient, rejectClient } = useSfdClients();
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [isValidateOpen, setIsValidateOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Filter only pending clients
  const pendingClients = clients.filter(client => client.status === 'pending');
  
  const handleValidate = async () => {
    if (!selectedClient) return;
    
    await validateClient.mutateAsync({ 
      clientId: selectedClient.id 
    });
    
    setSelectedClient(null);
    setIsValidateOpen(false);
    setNotes('');
  };
  
  const handleReject = async () => {
    if (!selectedClient) return;
    
    await rejectClient.mutateAsync({ 
      clientId: selectedClient.id 
    });
    
    setSelectedClient(null);
    setIsRejectOpen(false);
    setNotes('');
  };
  
  const openValidateDialog = (client: any) => {
    setSelectedClient(client);
    setIsValidateOpen(true);
  };
  
  const openRejectDialog = (client: any) => {
    setSelectedClient(client);
    setIsRejectOpen(true);
  };
  
  return (
    <div className="space-y-6 font-montserrat">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Demandes de clients en attente</h2>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader size="lg" className="text-primary" />
        </div>
      ) : pendingClients.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <User className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-medium mb-1">Aucune demande en attente</h3>
          <p className="text-muted-foreground">Toutes les demandes clients ont été traitées</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date de demande</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.full_name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 mr-1.5" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5 mr-1.5" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span>
                        {client.created_at && format(new Date(client.created_at), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300">En attente</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => openValidateDialog(client)}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Valider</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openRejectDialog(client)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Rejeter</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Validate Dialog */}
      <Dialog open={isValidateOpen} onOpenChange={setIsValidateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider le client</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de valider le compte client de <strong>{selectedClient?.full_name}</strong>.
              Une fois validé, le client aura accès à l'application N'gna sôrô.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea 
              placeholder="Ajouter des notes (optionnel)" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsValidateOpen(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleValidate}
              disabled={validateClient.isPending}
            >
              {validateClient.isPending ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Validation...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirmer la validation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de rejeter la demande client de <strong>{selectedClient?.full_name}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-md border border-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800">
                  Cette action ne peut pas être annulée. Le client devra soumettre une nouvelle demande s'il souhaite accéder à l'application.
                </p>
              </div>
            </div>
            
            <Textarea 
              placeholder="Motif du rejet (optionnel)" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={rejectClient.isPending}
            >
              {rejectClient.isPending ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Traitement...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Confirmer le rejet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientRequestList;


import React, { useState } from 'react';
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
import { ClientAdhesionRequest } from '@/hooks/useClientAdhesions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Phone, 
  Mail,
  CircleDollarSign,
  Briefcase,
  CreditCard
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';

export interface AdhesionRequestsTableProps {
  requests: ClientAdhesionRequest[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function AdhesionRequestsTable({ requests, isLoading, onRefresh }: AdhesionRequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<ClientAdhesionRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  
  const { processAdhesion } = useClientAdhesions();

  const handleProcess = async () => {
    if (!selectedRequest || !action) return;
    
    await processAdhesion.mutate({
      requestId: selectedRequest.id,
      action,
      notes: notes.trim() || undefined
    });

    if (onRefresh) {
      onRefresh();
    }

    setIsDialogOpen(false);
    setSelectedRequest(null);
    setNotes('');
    setAction(null);
  };

  const openProcessDialog = (request: ClientAdhesionRequest, processAction: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setAction(processAction);
    setIsDialogOpen(true);
  };

  // Status badges component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvée
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejetée
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Informations</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucune demande trouvée
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {format(new Date(request.created_at), 'PP', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{request.full_name}</div>
                    <div className="text-sm text-gray-500">
                      {request.reference_number || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        {request.phone}
                      </div>
                    )}
                    {request.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {request.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {request.profession && (
                      <div className="flex items-center text-sm">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {request.profession}
                      </div>
                    )}
                    {request.monthly_income && (
                      <div className="flex items-center text-sm">
                        <CircleDollarSign className="h-3 w-3 mr-1" />
                        {request.monthly_income.toLocaleString('fr-FR')} FCFA
                      </div>
                    )}
                    {request.id_number && (
                      <div className="flex items-center text-sm">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {request.id_type}: {request.id_number}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    {request.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => openProcessDialog(request, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => openProcessDialog(request, 'reject')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approuver la demande' : 'Rejeter la demande'}
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? 'Voulez-vous approuver cette demande d\'adhésion ?'
                : 'Veuillez indiquer la raison du rejet de cette demande.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes {action === 'reject' && '(obligatoire)'}</Label>
              <Textarea
                id="notes"
                placeholder={
                  action === 'approve'
                    ? 'Notes additionnelles (optionnel)'
                    : 'Raison du rejet'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleProcess}
              disabled={action === 'reject' && !notes.trim()}
              variant={action === 'approve' ? 'default' : 'destructive'}
            >
              {action === 'approve' ? 'Approuver' : 'Rejeter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

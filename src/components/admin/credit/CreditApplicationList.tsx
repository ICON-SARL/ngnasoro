
import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdminCommunication } from '@/hooks/useAdminCommunication';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Check, X, FileText, AlertTriangle } from 'lucide-react';

// Types for credit applications
interface CreditApplication {
  id: string;
  client_name: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  client_id: string;
  sfd_id: string;
}

// Sample data for demonstration
const sampleApplications: CreditApplication[] = [
  {
    id: '1',
    client_name: 'Amadou Diallo',
    amount: 500000,
    purpose: 'Achat de matériel agricole',
    status: 'pending',
    created_at: '2023-07-15T10:30:00Z',
    client_id: 'client-123',
    sfd_id: 'sfd-456'
  },
  {
    id: '2',
    client_name: 'Fatoumata Touré',
    amount: 750000,
    purpose: 'Fonds de roulement commerce',
    status: 'approved',
    created_at: '2023-07-14T14:15:00Z',
    client_id: 'client-124',
    sfd_id: 'sfd-456'
  },
  {
    id: '3',
    client_name: 'Ibrahim Koné',
    amount: 1200000,
    purpose: 'Expansion de commerce',
    status: 'rejected',
    created_at: '2023-07-13T09:45:00Z',
    client_id: 'client-125',
    sfd_id: 'sfd-456'
  }
];

export function CreditApplicationList() {
  const [applications] = useState<CreditApplication[]>(sampleApplications);
  const [selectedApp, setSelectedApp] = useState<CreditApplication | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
  const { toast } = useToast();
  const { sendNotification } = useAdminCommunication();

  const openApproveDialog = (app: CreditApplication) => {
    setSelectedApp(app);
    setDialogAction('approve');
    setDialogOpen(true);
  };

  const openRejectDialog = (app: CreditApplication) => {
    setSelectedApp(app);
    setDialogAction('reject');
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedApp) return;

    try {
      if (dialogAction === 'approve') {
        // Logic for approving application
        toast({
          title: "Approbation réussie",
          description: `La demande de crédit de ${selectedApp.client_name} a été approuvée.`
        });
        
        // Notify client
        await sendNotification({
          title: "Demande de crédit approuvée",
          message: `Votre demande de crédit de ${selectedApp.amount.toLocaleString('fr-ML')} FCFA a été approuvée.`,
          type: "success",
          recipient_id: selectedApp.client_id,
          action_link: `/credit/${selectedApp.id}`
        });
      } else {
        // Logic for rejecting application
        toast({
          title: "Demande rejetée",
          description: `La demande de crédit de ${selectedApp.client_name} a été rejetée.`,
          variant: "destructive"
        });
        
        // Notify client
        await sendNotification({
          title: "Demande de crédit rejetée",
          message: `Votre demande de crédit de ${selectedApp.amount.toLocaleString('fr-ML')} FCFA a été rejetée.`,
          type: "error",
          recipient_id: selectedApp.client_id,
          action_link: `/credit/${selectedApp.id}`
        });
      }
    } catch (error) {
      console.error("Error handling credit application:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement de la demande.",
        variant: "destructive"
      });
    } finally {
      setDialogOpen(false);
      setSelectedApp(null);
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Objet</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{app.client_name}</TableCell>
              <TableCell>{app.amount.toLocaleString('fr-ML')} FCFA</TableCell>
              <TableCell>{app.purpose}</TableCell>
              <TableCell>
                {app.status === 'pending' && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    En attente
                  </Badge>
                )}
                {app.status === 'approved' && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    <Check className="h-3 w-3 mr-1" />
                    Approuvée
                  </Badge>
                )}
                {app.status === 'rejected' && (
                  <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                    <X className="h-3 w-3 mr-1" />
                    Rejetée
                  </Badge>
                )}
              </TableCell>
              <TableCell>{new Date(app.created_at).toLocaleDateString('fr-ML')}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">Détails</span>
                  </Button>
                  
                  {app.status === 'pending' && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                        onClick={() => openRejectDialog(app)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Rejeter</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                        onClick={() => openApproveDialog(app)}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Approuver</span>
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === 'approve' ? 'Approuver la demande' : 'Rejeter la demande'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === 'approve' 
                ? `Êtes-vous sûr de vouloir approuver la demande de crédit de ${selectedApp?.client_name} pour un montant de ${selectedApp?.amount.toLocaleString('fr-ML')} FCFA ?` 
                : `Êtes-vous sûr de vouloir rejeter la demande de crédit de ${selectedApp?.client_name} ?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              className={dialogAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-destructive hover:bg-destructive/90'}
            >
              {dialogAction === 'approve' ? 'Approuver' : 'Rejeter'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

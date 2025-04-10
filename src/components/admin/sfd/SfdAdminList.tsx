
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, Mail, Trash2, User } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleteSfdAdmin } from '../hooks/sfd-admin/useDeleteSfdAdmin';
import { useSfdAdminsList } from '../hooks/sfd-admin/useSfdAdminsList';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SfdAdminListProps {
  sfdId: string;
}

export function SfdAdminList({ sfdId }: SfdAdminListProps) {
  const { sfdAdmins, isLoading, error, refetch } = useSfdAdminsList();
  const { deleteSfdAdmin, isDeleting, error: deleteError } = useDeleteSfdAdmin();

  const handleDeleteAdmin = (adminId: string) => {
    deleteSfdAdmin(adminId, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  // Filtrer les administrateurs pour cette SFD (à implémenter plus tard)
  // Pour l'instant, montrer tous les administrateurs SFD

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des administrateurs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des administrateurs: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (sfdAdmins.length === 0) {
    return (
      <div className="text-center py-6 bg-muted/20 rounded-md">
        <User className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">
          Aucun administrateur SFD trouvé.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deleteError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors de la suppression: {deleteError}
          </AlertDescription>
        </Alert>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sfdAdmins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell className="font-medium">{admin.full_name}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                  {admin.email}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={admin.has_2fa ? "default" : "outline"}>
                  {admin.has_2fa ? '2FA activé' : 'Sans 2FA'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 
                        <Loader2 className="h-4 w-4 animate-spin" /> : 
                        <Trash2 className="h-4 w-4" />
                      }
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer l'administrateur</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer cet administrateur ?
                        Cette action ne peut pas être annulée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDeleteAdmin(admin.id)}
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

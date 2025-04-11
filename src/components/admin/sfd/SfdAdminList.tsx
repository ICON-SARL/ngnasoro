
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSfdAdminsList } from '../hooks/sfd-admin/useSfdAdminsList';
import { Button } from '@/components/ui/button';
import { useDeleteSfdAdmin } from '../hooks/sfd-admin/useDeleteSfdAdmin';
import { Loader2, AlertTriangle, User, Mail, Shield, Trash } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SfdAdminListProps {
  sfdId: string;
  sfdName: string;
  onAddAdmin: () => void;
}

export function SfdAdminList({ sfdId, sfdName, onAddAdmin }: SfdAdminListProps) {
  const { sfdAdmins, isLoading, error, refetch } = useSfdAdminsList(sfdId);
  const { deleteSfdAdmin, isDeleting } = useDeleteSfdAdmin();
  const [adminToDelete, setAdminToDelete] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (!adminToDelete) return;
    
    try {
      await deleteSfdAdmin(adminToDelete);
      setAdminToDelete(null);
      refetch();
    } catch (err) {
      console.error("Error deleting admin:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error.toString()}</AlertDescription>
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      </Alert>
    );
  }

  if (!sfdAdmins || sfdAdmins.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-muted/20">
        <div className="mb-4 text-muted-foreground">
          Aucun administrateur trouvé pour cette SFD
        </div>
        <Button onClick={onAddAdmin}>
          Ajouter un administrateur
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sfdAdmins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell className="font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {admin.full_name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {admin.email}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Administrateur SFD
                </div>
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setAdminToDelete(admin.id)}
                      disabled={isDeleting}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setAdminToDelete(null)}>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Suppression...
                          </>
                        ) : (
                          'Supprimer'
                        )}
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

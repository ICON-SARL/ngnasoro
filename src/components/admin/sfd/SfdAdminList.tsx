
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Mail, User, Loader2 } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { useSfdAdminManagement } from '../hooks/useSfdAdminManagement';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

interface SfdAdminListProps {
  sfdId: string;
  sfdName: string;
  onAddAdmin: () => void;
}

export function SfdAdminList({ sfdId, sfdName, onAddAdmin }: SfdAdminListProps) {
  const { sfdAdmins, isLoading, error, refetchAdmins, deleteSfdAdmin } = useSfdAdminManagement();
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Load admins for this specific SFD
  useEffect(() => {
    if (sfdId) {
      refetchAdmins(sfdId);
    }
  }, [sfdId, refetchAdmins]);

  const handleDeleteAdmin = async () => {
    if (selectedAdminId) {
      await deleteSfdAdmin(selectedAdminId);
      setIsDeleteDialogOpen(false);
      refetchAdmins(sfdId);
    }
  };

  const confirmDelete = (adminId: string) => {
    setSelectedAdminId(adminId);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">
        <p>Une erreur est survenue lors du chargement des administrateurs</p>
      </div>
    );
  }

  const filteredAdmins = sfdAdmins?.filter(admin => admin.sfd_id === sfdId) || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Administrateurs de {sfdName}</h3>
        <Button onClick={onAddAdmin} size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter un administrateur
        </Button>
      </div>
      
      {filteredAdmins.length === 0 ? (
        <div className="bg-muted/20 p-8 text-center rounded-md border">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Aucun administrateur n'est associé à cette SFD</p>
          <Button onClick={onAddAdmin} variant="outline" className="mt-4">
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter un administrateur
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.full_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <span>{admin.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {admin.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(admin.created_at)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => confirmDelete(admin.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet administrateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAdmin}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

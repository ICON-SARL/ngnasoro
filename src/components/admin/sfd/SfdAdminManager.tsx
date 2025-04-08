import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useSfdAdminManagement } from '@/hooks/useSfdAdminManagement';
import { AddSfdAdminDialog } from '@/components/admin/sfd/add-admin-dialog';
import { EditSfdAdminDialog } from '@/components/admin/sfd/EditSfdAdminDialog';
import { SfdAdmin } from '@/components/admin/hooks/sfd-admin/types';
import { useSfdAdminsList } from '@/components/admin/hooks/sfd-admin';
import { Plus, Loader2, Pencil, Trash2, User } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SfdAdminManagerProps {
  sfdId: string;
  sfdName: string;
}

export function SfdAdminManager({ sfdId, sfdName }: SfdAdminManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<SfdAdmin | null>(null);
  
  const { sfdAdmins, isLoading: isLoadingList, refetch } = useSfdAdminsList(sfdId);
  const { isLoading, error, addSfdAdmin, updateSfdAdmin, deleteSfdAdmin } = useSfdAdminManagement();

  const handleAddAdmin = (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    sfd_id: string;
    notify: boolean;
  }) => {
    addSfdAdmin(data, {
      onSuccess: () => {
        setShowAddDialog(false);
        refetch();
      }
    });
  };

  const handleEditAdmin = (data: {
    adminId: string;
    role: string;
    has2FA?: boolean;
    is_active?: boolean;
  }) => {
    updateSfdAdmin(data, {
      onSuccess: () => {
        setShowEditDialog(false);
        refetch();
      }
    });
  };

  const handleDeleteAdmin = () => {
    if (selectedAdmin) {
      deleteSfdAdmin(selectedAdmin.id, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          refetch();
        }
      });
    }
  };

  const openEditDialog = (admin: SfdAdmin) => {
    setSelectedAdmin(admin);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (admin: SfdAdmin) => {
    setSelectedAdmin(admin);
    setShowDeleteDialog(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Administrateurs SFD</CardTitle>
          <CardDescription>Gérer les administrateurs de {sfdName}</CardDescription>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un administrateur
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingList ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sfdAdmins && sfdAdmins.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sfdAdmins.map(admin => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span>{admin.full_name || 'Non spécifié'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant={admin.role === 'sfd_admin' ? 'default' : 'secondary'}>
                      {admin.role === 'sfd_admin' ? 'Admin SFD' : 
                       admin.role === 'support' ? 'Support' : 'Utilisateur'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.is_active !== false ? 'default' : 'destructive'}>
                      {admin.is_active !== false ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditDialog(admin)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive/90" 
                        onClick={() => openDeleteDialog(admin)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun administrateur trouvé pour cette SFD</p>
            <p className="text-sm">Cliquez sur "Ajouter un administrateur" pour commencer</p>
          </div>
        )}
        
        <AddSfdAdminDialog
          isOpen={showAddDialog}
          onOpenChange={setShowAddDialog}
          sfdId={sfdId}
          sfdName={sfdName}
          onAddAdmin={handleAddAdmin}
          isLoading={isLoading}
          error={error}
        />
        
        <EditSfdAdminDialog
          admin={selectedAdmin}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={handleEditAdmin}
          isLoading={isLoading}
        />
        
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Cela supprimera définitivement le compte administrateur
                {selectedAdmin && ` de ${selectedAdmin.email}`}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAdmin}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? (
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
      </CardContent>
    </Card>
  );
}

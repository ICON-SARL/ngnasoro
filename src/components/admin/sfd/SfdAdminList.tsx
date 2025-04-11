
import React, { useState, useEffect } from 'react';
import { useSfdAdminsList } from '@/components/admin/hooks/sfd-admin/useSfdAdminsList';
import { useDeleteSfdAdmin } from '@/components/admin/hooks/sfd-admin/useDeleteSfdAdmin';
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Trash2, RefreshCw, UserPlus, AlertCircle,
  Mail, Shield, Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDate } from '@/utils/formatters';

interface SfdAdminListProps {
  sfdId: string;
  sfdName: string;
  onAddAdmin: () => void;
}

export function SfdAdminList({ sfdId, sfdName, onAddAdmin }: SfdAdminListProps) {
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    sfdAdmins, 
    isLoading, 
    error, 
    refetch 
  } = useSfdAdminsList(sfdId);
  
  const { 
    deleteSfdAdmin, 
    isDeleting, 
    error: deleteError 
  } = useDeleteSfdAdmin();

  // Effet pour retenter automatiquement le chargement en cas d'erreur
  useEffect(() => {
    if (error && retryCount < 2) {
      const timer = setTimeout(() => {
        console.log(`Nouvelle tentative de chargement (${retryCount + 1}/2)...`);
        refetch();
        setRetryCount(prev => prev + 1);
      }, 3000); // Attendre 3 secondes avant de réessayer
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, refetch]);

  const handleDeleteConfirm = async () => {
    if (selectedAdminId) {
      await deleteSfdAdmin({ adminId: selectedAdminId });
      setIsConfirmOpen(false);
      setSelectedAdminId(null);
      refetch();
    }
  };

  const handleDeleteCancel = () => {
    setIsConfirmOpen(false);
    setSelectedAdminId(null);
  };

  const promptDelete = (adminId: string) => {
    setSelectedAdminId(adminId);
    setIsConfirmOpen(true);
  };

  const handleRetry = () => {
    setRetryCount(0);
    refetch();
  };

  // Si une erreur persiste après plusieurs tentatives, afficher l'erreur
  if (error && retryCount >= 2) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur de chargement</AlertTitle>
        <AlertDescription>
          Impossible de charger les administrateurs SFD. {error}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" /> Réessayer
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Afficher un état de chargement
  if (isLoading && !sfdAdmins.length) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sfdAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 py-4">
                    <Shield className="h-10 w-10 text-gray-300" />
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Aucun administrateur pour {sfdName}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2" 
                        onClick={onAddAdmin}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Ajouter un administrateur
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sfdAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.full_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      {admin.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Administrateur SFD
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      {admin.last_sign_in_at 
                        ? formatDate(admin.last_sign_in_at)
                        : 'Jamais connecté'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => promptDelete(admin.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Supprimer l'administrateur"
        description="Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />
    </div>
  );
}

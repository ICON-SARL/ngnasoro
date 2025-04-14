
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAddSfdAdmin } from '@/hooks/useAddSfdAdmin';
import { AddSfdAdminDialog } from '@/components/admin/sfd/AddSfdAdminDialog';
import { SfdAdminList } from '@/components/admin/sfd/SfdAdminList';
import { Plus, Loader2, RefreshCw, UserCog, AlertCircle } from 'lucide-react';
import { useSfdAdminsList } from '../hooks/sfd-admin/useSfdAdminsList';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SfdAdminAssociationDialog } from './SfdAdminAssociationDialog';

interface SfdAdminManagerProps {
  sfdId: string;
  sfdName: string;
}

export function SfdAdminManager({ sfdId, sfdName }: SfdAdminManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { 
    sfdAdmins,
    isLoading: isLoadingAdmins, 
    error: fetchError,
    refetch: refetchAdmins 
  } = useSfdAdminsList(sfdId);
  
  const { 
    addSfdAdmin, 
    isAdding, 
    error: addError 
  } = useAddSfdAdmin();

  // Mettre à jour le message d'erreur si nécessaire
  useEffect(() => {
    if (fetchError) {
      setErrorMessage(`Erreur de chargement des administrateurs: ${fetchError instanceof Error ? fetchError.message : 'Erreur inconnue'}`);
    } else if (addError) {
      setErrorMessage(addError);
    } else {
      setErrorMessage(null);
    }
  }, [fetchError, addError]);

  const handleAddAdmin = async (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    sfd_id: string;
    notify: boolean;
  }) => {
    try {
      setErrorMessage(null);
      await addSfdAdmin({
        ...data,
        role: 'sfd_admin' // Forcer le rôle à sfd_admin pour plus de sécurité
      });
      setShowAddDialog(false);
      
      // Actualiser la liste après un court délai
      setTimeout(() => {
        refetchAdmins();
        toast({
          title: "Succès",
          description: `L'administrateur ${data.full_name} a été ajouté avec succès`,
        });
      }, 1000);
    } catch (error: any) {
      console.error("Error in handleAddAdmin:", error);
      setErrorMessage(error.message || "Impossible d'ajouter l'administrateur");
      // Garder la boîte de dialogue ouverte pour permettre à l'utilisateur de corriger l'erreur
    }
  };

  const handleRefresh = () => {
    setErrorMessage(null);
    refetchAdmins();
    toast({
      title: "Actualisation",
      description: "La liste des administrateurs est en cours d'actualisation",
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Administrateurs SFD</CardTitle>
          <CardDescription>Gérer les administrateurs de {sfdName}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isLoadingAdmins || isAdding}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingAdmins ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={() => setShowAddDialog(true)}
            disabled={isLoadingAdmins || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un administrateur
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <SfdAdminList 
          sfdId={sfdId} 
          sfdName={sfdName}
          onAddAdmin={() => setShowAddDialog(true)} 
        />
        
        <AddSfdAdminDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          sfdId={sfdId}
          sfdName={sfdName}
          onAddAdmin={handleAddAdmin}
          isLoading={isAdding}
          error={errorMessage}
        />
      </CardContent>
    </Card>
  );
}

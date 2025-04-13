
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddSfdForm } from '@/components/admin/sfd/AddSfdForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateSfdMutation } from '@/components/admin/hooks/sfd-management/mutations/useCreateSfdMutation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SfdAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SfdAddDialog: React.FC<SfdAddDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createSfdMutation = useCreateSfdMutation();
  const [error, setError] = useState<string | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // Reset state when dialog opens or closes
  useEffect(() => {
    setError(null);
    setIsTimedOut(false);
    
    // Clear any existing timeouts
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [open]);

  // Function to cancel creation and show error
  const handleCancel = () => {
    if (createSfdMutation.isPending) {
      createSfdMutation.reset();
    }
    setIsTimedOut(false);
    onOpenChange(false);
  };

  const handleSubmit = async (formData: any, createAdmin: boolean, adminData: any) => {
    setError(null);
    setIsTimedOut(false);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    try {
      console.log("SfdAddDialog: handleSubmit called with:", { 
        formData, 
        createAdmin, 
        adminData: adminData ? {...adminData, password: "***"} : null 
      });
      
      // Set a timeout to show a message if creation takes too long
      const id = window.setTimeout(() => {
        setIsTimedOut(true);
      }, 30000); // 30 seconds timeout
      
      setTimeoutId(id);
      
      await createSfdMutation.mutateAsync({
        sfdData: formData,
        createAdmin,
        adminData: createAdmin ? adminData : undefined
      });
      
      // Clear timeout since operation completed
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      // Close the dialog
      onOpenChange(false);
      
      toast({
        title: 'SFD créée avec succès',
        description: createAdmin 
          ? `La SFD ${formData.name} a été créée avec un administrateur`
          : `La SFD ${formData.name} a été créée`,
      });
      
      // Refresh the SFDs list and stats
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-management-stats'] });
    } catch (error: any) {
      // Clear timeout since operation failed
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      console.error('Error creating SFD:', error);
      setError(error.message || "Une erreur s'est produite lors de la création de la SFD");
      toast({
        title: 'Erreur',
        description: `Impossible de créer la SFD: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing if operation is in progress without confirmation
      if (createSfdMutation.isPending && open && !newOpen) {
        const confirmed = window.confirm("La création de la SFD est en cours. Êtes-vous sûr de vouloir annuler ?");
        if (!confirmed) return;
        
        // If confirmed, cancel the operation
        createSfdMutation.reset();
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle SFD</DialogTitle>
          <DialogDescription>
            Remplissez les informations nécessaires pour créer une nouvelle SFD
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isTimedOut && (
          <Alert variant="warning" className="mb-4 border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              La création de la SFD prend plus de temps que prévu. Vous pouvez continuer à attendre ou annuler et réessayer.
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel} 
                  className="mr-2 border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                >
                  Annuler
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <AddSfdForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={createSfdMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};


import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssociateSfdAdmin } from '../hooks/sfd-admin/useAssociateSfdAdmin';
import { supabase } from '@/integrations/supabase/client';

interface SfdAdminAssociationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  sfdId?: string;
  sfdName?: string;
}

export function SfdAdminAssociationDialog({ 
  open, 
  onOpenChange,
  onSuccess,
  sfdId,
  sfdName
}: SfdAdminAssociationDialogProps) {
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [makeDefault, setMakeDefault] = useState(true);
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { associateAdminWithSfd, isAssociating, error: associationError } = useAssociateSfdAdmin();

  // Charger la liste des administrateurs disponibles
  useEffect(() => {
    if (open && sfdId) {
      fetchAvailableAdmins();
    }
  }, [open, sfdId]);

  const fetchAvailableAdmins = async () => {
    if (!sfdId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Récupération des admins disponibles pour la SFD: ${sfdId}`);
      
      // Récupérer tous les administrateurs SFD
      const { data: allAdmins, error: adminsError } = await supabase
        .from('admin_users')
        .select('id, full_name, email')
        .eq('role', 'sfd_admin');
      
      if (adminsError) {
        // Si la requête directe échoue, essayons une approche alternative
        if (adminsError.message.includes('recursion detected')) {
          console.log('Détection de récursion dans la politique, essai d\'une méthode alternative');
          
          // Récupérer via la fonction edge (plus sécurisée en cas de problèmes avec les politiques RLS)
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('fetch-admin-users');
          
          if (edgeError) {
            throw new Error(`Erreur lors de la récupération via Edge Function: ${edgeError.message}`);
          }
          
          // Filtrer pour ne garder que les admin_sfd
          const sfdAdmins = edgeData.filter((admin: any) => admin.role === 'sfd_admin');
          console.log(`Récupéré ${sfdAdmins.length} admins via Edge Function`);
          
          // Utiliser ces données
          const sortedAdmins = [...sfdAdmins].sort((a, b) => 
            a.full_name.localeCompare(b.full_name));
          setAdmins(sortedAdmins);
          setIsLoading(false);
          return;
        }
        
        throw adminsError;
      }
      
      console.log(`Récupéré ${allAdmins?.length || 0} administrateurs au total`);

      if (!allAdmins || allAdmins.length === 0) {
        setAdmins([]);
        setIsLoading(false);
        return;
      }
      
      // Trier les admins par nom
      const sortedAdmins = [...allAdmins].sort((a, b) => 
        a.full_name.localeCompare(b.full_name));
      
      setAdmins(sortedAdmins);
    } catch (err: any) {
      console.error("Erreur lors du chargement des administrateurs:", err);
      setError("Impossible de charger la liste des administrateurs");
      toast({
        title: 'Erreur',
        description: "Impossible de charger la liste des administrateurs",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssociate = async () => {
    if (!selectedAdminId || !sfdId) {
      setError("Veuillez sélectionner un administrateur");
      return;
    }
    
    const success = await associateAdminWithSfd(selectedAdminId, sfdId, makeDefault);
    
    if (success) {
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }
  };

  const displayError = error || associationError;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        setSelectedAdminId('');
        setError(null);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Associer un administrateur à {sfdName}</DialogTitle>
          <DialogDescription>
            Sélectionnez un administrateur existant pour l'associer à cette SFD
          </DialogDescription>
        </DialogHeader>

        {displayError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="admin-select">Administrateur</Label>
            {isLoading ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Chargement des administrateurs...</span>
              </div>
            ) : admins.length > 0 ? (
              <Select 
                value={selectedAdminId} 
                onValueChange={setSelectedAdminId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un administrateur" />
                </SelectTrigger>
                <SelectContent>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.full_name} ({admin.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground p-2 border rounded-md">
                Aucun administrateur disponible pour association. Vous devez d'abord créer un administrateur SFD.
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="make-default" 
              checked={makeDefault}
              onCheckedChange={setMakeDefault}
            />
            <Label htmlFor="make-default">Définir comme SFD par défaut pour cet administrateur</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isAssociating}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleAssociate} 
            disabled={!selectedAdminId || isAssociating}
          >
            {isAssociating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Association...
              </>
            ) : (
              'Associer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import React, { useEffect } from 'react';
import { useSfdAdminsList } from '../hooks/sfd-admin/useSfdAdminsList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, UserCog, ShieldAlert, Clock, Check, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SfdAdminListProps {
  sfdId: string;
  sfdName: string;
  onAddAdmin: () => void;
}

export function SfdAdminList({ sfdId, sfdName, onAddAdmin }: SfdAdminListProps) {
  const { sfdAdmins, isLoading, error, refetch } = useSfdAdminsList(sfdId);
  
  useEffect(() => {
    // Charger la liste des administrateurs au montage du composant
    if (sfdId) {
      refetch();
    }
  }, [sfdId, refetch]);
  
  const handleRetry = () => {
    refetch();
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Chargement des administrateurs...</p>
      </div>
    );
  }
  
  // Custom error message for the infinite recursion issue
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des administrateurs';
    const isRecursionError = errorMessage.includes('recursion') || errorMessage.includes('user_sfds');
    
    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="mb-4">
          <ShieldAlert className="h-4 w-4 mr-2" />
          <AlertDescription>
            {isRecursionError 
              ? "Erreur de configuration des politiques de sécurité. Contactez l'administrateur système." 
              : errorMessage}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col items-center justify-center py-6">
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
          
          <Button
            onClick={onAddAdmin}
          >
            Ajouter un administrateur
          </Button>
        </div>
      </div>
    );
  }
  
  if (!sfdAdmins || sfdAdmins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-lg">
        <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucun administrateur</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Cette SFD n'a pas encore d'administrateurs. Les administrateurs SFD peuvent gérer les clients,
          les prêts et les opérations pour {sfdName}.
        </p>
        <Button onClick={onAddAdmin}>
          Ajouter un administrateur
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {sfdAdmins.map((admin) => (
          <div 
            key={admin.id}
            className="p-4 border rounded-lg bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center">
                <div className="mr-2 bg-primary/10 p-2 rounded-full">
                  <UserCog className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{admin.full_name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {admin.last_sign_in_at ? (
                      formatDistanceToNow(new Date(admin.last_sign_in_at), { 
                        addSuffix: true,
                        locale: fr
                      })
                    ) : (
                      'Jamais connecté'
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Check className="h-3 w-3 mr-1" />
                Actif
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

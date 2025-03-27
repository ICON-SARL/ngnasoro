
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle, AlertCircle, ArrowRightCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { SfdData } from '@/hooks/useSfdDataAccess';

interface SfdAccountsSectionProps {
  sfdData?: SfdData[];
  activeSfdId?: string | null;
  onSwitchSfd?: (sfdId: string) => Promise<boolean> | void;
}

const SfdAccountsSection: React.FC<SfdAccountsSectionProps> = ({ 
  sfdData: propsSfdData,
  activeSfdId: propsActiveSfdId,
  onSwitchSfd
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeSfdId: authActiveSfdId, setActiveSfdId } = useAuth();
  const { sfdAccounts, isLoading, refetch, synchronizeBalances } = useSfdAccounts();
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  
  const effectiveActiveSfdId = propsActiveSfdId !== undefined ? propsActiveSfdId : authActiveSfdId;

  const handleSwitchSfd = async (sfdId: string) => {
    setSwitchingId(sfdId);
    try {
      if (onSwitchSfd) {
        await onSwitchSfd(sfdId);
      } else {
        setActiveSfdId(sfdId);
        // Sync balances when switching SFDs
        await synchronizeBalances.mutateAsync();
        refetch();
      }
      
      toast({
        title: "SFD changée avec succès",
        description: "Vous êtes maintenant connecté à une nouvelle SFD",
      });
    } catch (error) {
      toast({
        title: "Erreur de changement",
        description: "Impossible de changer de SFD pour le moment",
        variant: "destructive",
      });
    } finally {
      setSwitchingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mes Comptes SFD</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-center py-6">
            Chargement de vos comptes SFD...
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayAccounts = propsSfdData || sfdAccounts;

  // If no SFD accounts are available
  if (displayAccounts.length === 0) {
    return (
      <div className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mes Comptes SFD</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-3" />
              <h3 className="text-lg font-medium mb-2">Aucun compte SFD</h3>
              <p className="text-gray-500 mb-4">
                Vous n'avez pas encore connecté de compte auprès d'une institution SFD.
                Connectez un compte pour accéder à vos soldes et prêts.
              </p>
              <Button 
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                onClick={() => navigate('/sfd-selector')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une SFD
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mes Comptes SFD</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {displayAccounts.map((sfd) => (
              <div key={sfd.id} className="flex items-center justify-between border p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {sfd.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium">{sfd.name}</p>
                    <div className="flex items-center space-x-1">
                      {sfd.id === effectiveActiveSfdId ? (
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Compte actif
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          En attente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {sfd.id !== effectiveActiveSfdId && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleSwitchSfd(sfd.id)}
                    disabled={switchingId === sfd.id || synchronizeBalances.isLoading}
                  >
                    {switchingId === sfd.id ? 'Changement...' : 'Basculer'}
                  </Button>
                )}
                {sfd.id === effectiveActiveSfdId && (
                  <span className="text-xs font-medium text-green-600 px-2 py-1 bg-green-50 rounded-md">
                    Active
                  </span>
                )}
              </div>
            ))}

            <Button 
              variant="outline" 
              className="w-full mt-3 border-dashed"
              onClick={() => navigate('/sfd-selector')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une SFD
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdAccountsSection;

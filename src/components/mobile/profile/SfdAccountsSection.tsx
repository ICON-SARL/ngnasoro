
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SfdData } from '@/hooks/useSfdDataAccess';
import { Plus, CheckCircle, AlertCircle, ArrowRightCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SfdAccountsSectionProps {
  sfdData: SfdData[];
  activeSfdId: string | null;
  onSwitchSfd: (sfdId: string) => Promise<boolean>;
}

const SfdAccountsSection = ({ sfdData, activeSfdId, onSwitchSfd }: SfdAccountsSectionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const handleSwitchSfd = async (sfdId: string) => {
    setSwitchingId(sfdId);
    try {
      // In a real app, this could trigger biometric authentication
      const result = await onSwitchSfd(sfdId);
      if (result) {
        toast({
          title: "SFD changée avec succès",
          description: "Vous êtes maintenant connecté à une nouvelle SFD",
        });
      }
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

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Mes Comptes SFD</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {sfdData.map((sfd) => (
              <div key={sfd.id} className="flex items-center justify-between border p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {sfd.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium">{sfd.name}</p>
                    <div className="flex items-center space-x-1">
                      {sfd.id === activeSfdId ? (
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
                {sfd.id !== activeSfdId && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleSwitchSfd(sfd.id)}
                    disabled={switchingId === sfd.id}
                  >
                    {switchingId === sfd.id ? 'Changement...' : 'Basculer'}
                  </Button>
                )}
                {sfd.id === activeSfdId && (
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

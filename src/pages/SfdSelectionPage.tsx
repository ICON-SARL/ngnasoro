
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess, SfdData } from '@/hooks/useSfdDataAccess';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const SfdSelectionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sfdData, isLoading, switchActiveSfd } = useSfdDataAccess();
  const [selectedSfdId, setSelectedSfdId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleSelectSfd = async () => {
    if (!selectedSfdId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une SFD",
        variant: "destructive",
      });
      return;
    }
    
    const success = await switchActiveSfd(selectedSfdId);
    if (success) {
      toast({
        title: "Succès",
        description: "SFD sélectionnée avec succès",
      });
      navigate('/sfd/dashboard');
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de sélectionner la SFD",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Chargement des SFDs...</span>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">Sélectionner une SFD</CardTitle>
        </CardHeader>
        <CardContent>
          {sfdData.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Aucune SFD n'est associée à votre compte.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Retour à l'accueil
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-6">
                {sfdData.map((sfd) => (
                  <div 
                    key={sfd.id}
                    onClick={() => setSelectedSfdId(sfd.id)}
                    className={`p-3 border rounded-lg cursor-pointer ${
                      selectedSfdId === sfd.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      {sfd.logo_url && (
                        <div className="w-10 h-10 mr-3 bg-gray-100 rounded-full overflow-hidden">
                          <img src={sfd.logo_url} alt={sfd.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{sfd.name}</h3>
                        {sfd.region && <p className="text-xs text-gray-500">{sfd.region}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Annuler
                </Button>
                <Button onClick={handleSelectSfd}>
                  Confirmer
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdSelectionPage;

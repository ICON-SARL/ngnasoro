
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAvailableSfds } from '@/hooks/sfd/useAvailableSfds';

const SFDSelector = () => {
  const [selectedSfd, setSelectedSfd] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    availableSfds, 
    pendingRequests, 
    isLoading, 
    requestSfdAccess,
    refreshData 
  } = useAvailableSfds(user?.id);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour accéder à cette page",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    // Refresh data when component mounts
    refreshData();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSelect = (sfdId: string) => {
    setSelectedSfd(sfdId);
  };

  const handleConnect = async () => {
    if (!selectedSfd) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un SFD",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour envoyer une demande",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    const success = await requestSfdAccess(selectedSfd);
    if (success) {
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'accès a été envoyée avec succès"
      });
      navigate('/mobile-flow/main');
    }
  };

  return (
    <div className="container mx-auto max-w-md p-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4" 
        onClick={handleGoBack}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Retour
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center text-[#0D6A51]">
            Sélectionner un SFD
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pb-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#0D6A51]" />
            </div>
          ) : availableSfds.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-600">Aucun SFD disponible pour le moment.</p>
              <p className="text-sm text-gray-500 mt-2 mb-4">
                Toutes les SFDs sont déjà associées à votre compte ou en attente de validation.
              </p>
              <Button onClick={refreshData} variant="outline" className="mb-2">
                <Loader2 className="h-4 w-4 mr-2" /> Actualiser la liste
              </Button>
              <Button onClick={() => navigate('/mobile-flow/main')}>
                Retour à l'accueil
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {availableSfds.map(sfd => (
                  <div 
                    key={sfd.id}
                    className={`p-3 border rounded-lg cursor-pointer ${
                      selectedSfd === sfd.id ? 'border-[#0D6A51] bg-[#0D6A51]/5' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelect(sfd.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          {sfd.logo_url ? (
                            <img src={sfd.logo_url} alt={sfd.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <Building className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{sfd.name}</h3>
                          <p className="text-sm text-gray-500">{sfd.region || sfd.code}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        selectedSfd === sfd.id ? 'border-[#0D6A51] bg-[#0D6A51]' : 'border-gray-300'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                disabled={!selectedSfd}
                onClick={handleConnect}
              >
                Connecter ce SFD
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SFDSelector;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, Building, Loader2 } from 'lucide-react';
import { useSfdAdhesion } from '@/hooks/sfd/useSfdAdhesion';

const SfdSelector = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { availableSfds, requestSfdAdhesion } = useSfdAdhesion();
  
  const handleSendRequest = async (sfdId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour envoyer une demande",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const userInfo = {
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || ''
      };
      
      const success = await requestSfdAdhesion(sfdId, userInfo);
      
      if (success) {
        toast({
          title: "Succès",
          description: "Votre demande d'adhésion a été envoyée avec succès",
        });
        navigate('/mobile-flow/account');
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full max-w-md mx-auto">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Sélectionner une SFD
          </h2>
          {availableSfds && availableSfds.length > 0 ? (
            <div className="space-y-4">
              {availableSfds.map((sfd) => (
                <div
                  key={sfd.id}
                  className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="text-lg font-medium">{sfd.name}</h3>
                      <p className="text-sm text-gray-500">{sfd.code}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSendRequest(sfd.id)}
                    disabled={isSubmitting}
                    className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      "Rejoindre"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">
                Aucune SFD disponible pour le moment.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SfdSelector;

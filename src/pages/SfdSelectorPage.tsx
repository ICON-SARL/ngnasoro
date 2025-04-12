import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Building } from 'lucide-react';
import SfdList from '@/components/mobile/sfd/SfdList';
import { supabase } from '@/integrations/supabase/client';

interface LocationState {
  selectedSfdId?: string;
}

const SfdSelectorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { selectedSfdId } = (location.state as LocationState) || {};

  useEffect(() => {
    if (selectedSfdId) {
      console.log('Selected SFD ID:', selectedSfdId);
    }
  }, [selectedSfdId]);

  const handleSendRequest = async (sfdId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour envoyer une demande",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: existingClient, error: checkError } = await supabase
        .from('sfd_clients')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .single();
      
      if (existingClient) {
        if (existingClient.status === 'validated') {
          toast({
            title: "Information",
            description: "Vous êtes déjà client de cette SFD",
          });
        } else {
          toast({
            title: "Information",
            description: "Vous avez déjà une demande en cours pour cette SFD",
          });
        }
        return;
      }
      
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          status: 'pending',
          full_name: user.user_metadata?.full_name || '',
          kyc_level: 0
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande a été envoyée avec succès. Vous serez notifié lorsqu'elle sera traitée.",
      });
      
      navigate('/mobile-flow/profile');
    } catch (error: any) {
      console.error('Erreur lors de la soumission de la demande:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre demande. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-lg font-medium flex-1 text-center text-[#0D6A51]">
          SFDs Disponibles
        </h1>
        <div className="w-10"></div> {/* Spacer for center alignment */}
      </header>
      
      <main className="flex-1 container mx-auto max-w-md p-4">
        <Card className="p-4 mb-4 bg-white shadow-sm">
          <div className="flex items-start space-x-3">
            <Building className="h-6 w-6 text-[#0D6A51] mt-1" />
            <div>
              <h2 className="font-medium text-gray-900">SFDs Partenaires MEREF</h2>
              <p className="text-sm text-gray-600 mt-1">
                Sélectionnez une SFD pour envoyer une demande d'association de compte. 
                L'agent SFD vérifiera votre identité et validera votre compte.
              </p>
            </div>
          </div>
        </Card>
        
        <SfdList onSelectSfd={handleSendRequest} />
      </main>
    </div>
  );
};

export default SfdSelectorPage;

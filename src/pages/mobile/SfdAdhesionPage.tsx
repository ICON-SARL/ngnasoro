
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Building, Loader2 } from 'lucide-react';
import MobileLayout from '@/components/mobile/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { NewAdhesionRequestForm } from '@/components/client/NewAdhesionRequestForm';

const SfdAdhesionPage: React.FC = () => {
  const navigate = useNavigate();
  const { sfdId } = useParams<{ sfdId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sfdName, setSfdName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubmittedRequest, setHasSubmittedRequest] = useState(false);
  
  // Récupérer les informations de la SFD
  React.useEffect(() => {
    const fetchSfdInfo = async () => {
      if (!sfdId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sfds')
          .select('name')
          .eq('id', sfdId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setSfdName(data.name);
        }
        
        // Vérifier si l'utilisateur a déjà une demande en cours pour cette SFD
        if (user) {
          const { data: existingRequest, error: requestError } = await supabase
            .from('client_adhesion_requests')
            .select('status')
            .eq('user_id', user.id)
            .eq('sfd_id', sfdId)
            .maybeSingle();
            
          if (requestError) {
            console.error('Erreur lors de la vérification des demandes existantes:', requestError);
          } else if (existingRequest) {
            setHasSubmittedRequest(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de la SFD:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer les informations de la SFD',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSfdInfo();
  }, [sfdId, user, toast]);
  
  const handleSubmissionSuccess = () => {
    setHasSubmittedRequest(true);
    setIsSubmitting(false);
    toast({
      title: 'Demande envoyée',
      description: `Votre demande d'adhésion à ${sfdName} a été envoyée avec succès. Vous serez notifié lorsqu'elle sera approuvée.`,
    });
  };
  
  return (
    <MobileLayout>
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 p-0"
            onClick={() => navigate('/mobile-flow/account')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Adhésion SFD</h1>
            <p className="text-gray-500 text-sm">Demande d'adhésion à {sfdName || 'une SFD'}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : hasSubmittedRequest ? (
          <Card className="mb-6">
            <CardContent className="p-4 flex flex-col items-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Building className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Demande envoyée !</h2>
              <p className="text-gray-500 text-sm text-center mb-4">
                Votre demande d'adhésion est en cours de traitement. Vous serez notifié lorsqu'elle sera approuvée.
              </p>
              <Button 
                className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                onClick={() => navigate('/mobile-flow/account')}
              >
                Retour à mon compte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardContent className="p-4 flex flex-col items-center">
                <div className="h-16 w-16 bg-[#0D6A51]/10 rounded-full flex items-center justify-center mb-4">
                  <Building className="h-8 w-8 text-[#0D6A51]" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Adhésion à {sfdName}</h2>
                <p className="text-gray-500 text-sm text-center mb-4">
                  Remplissez le formulaire ci-dessous pour faire une demande d'adhésion à cette SFD.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Formulaire de demande</h3>
                {sfdId && (
                  <NewAdhesionRequestForm 
                    sfdId={sfdId} 
                    onSuccess={handleSubmissionSuccess}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MobileLayout>
  );
};

export default SfdAdhesionPage;

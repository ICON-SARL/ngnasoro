import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, CheckCircle, XCircle, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { NewAdhesionRequestForm } from '@/components/client/NewAdhesionRequestForm';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader } from '@/components/ui/loader';
import { formatDate } from '@/utils/formatters';
import { supabase } from '@/integrations/supabase/client';

const SfdAdhesionPage: React.FC = () => {
  const { sfdId } = useParams<{ sfdId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    userAdhesionRequests, 
    isLoadingUserAdhesionRequests, 
    refetchUserAdhesionRequests
  } = useClientAdhesions();
  
  const [sfdInfo, setSfdInfo] = useState<{ name: string; region?: string } | null>(null);
  const [isLoadingSfd, setIsLoadingSfd] = useState(false);
  const [sfdError, setSfdError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchSfdInfo = async () => {
      if (!sfdId) return;
      
      setIsLoadingSfd(true);
      setSfdError(null);
      
      try {
        console.log('Fetching SFD info for ID:', sfdId);
        
        const { data, error } = await supabase
          .from('sfds')
          .select('name, region')
          .eq('id', sfdId)
          .eq('status', 'active')
          .maybeSingle();
          
        if (error) {
          console.error('Error technique lors de la récupération des informations SFD:', error);
          setSfdError('Une erreur technique est survenue. Veuillez réessayer.');
          throw error;
        }
        
        if (data) {
          console.log('SFD found:', data);
          setSfdInfo(data);
        } else {
          console.log('SFD not found or inactive:', sfdId);
          setSfdError('Cette SFD n\'est pas disponible actuellement.');
          navigate('/mobile-flow/account');
        }
      } catch (error) {
        console.error('Error in fetchSfdInfo:', error);
      } finally {
        setIsLoadingSfd(false);
      }
    };
    
    fetchSfdInfo();
    refetchUserAdhesionRequests();
  }, [sfdId, toast, refetchUserAdhesionRequests, navigate]);

  if (!sfdId) {
    return (
      <div className="container max-w-md mx-auto py-4 px-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <Alert className="mt-4">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Identifiant SFD manquant</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const existingRequest = userAdhesionRequests.find(
    request => request.sfd_id === sfdId
  );
  
  return (
    <div className="container max-w-md mx-auto py-4 px-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate('/mobile-flow/account')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Building className="h-5 w-5 mr-2 text-[#0D6A51]" />
            {isLoadingSfd ? (
              <span className="flex items-center">
                Chargement... <Loader className="ml-2" />
              </span>
            ) : (
              <>Demande d'adhésion {sfdInfo && <span className="text-[#0D6A51]">{sfdInfo.name}</span>}</>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pb-6">
          {isLoadingUserAdhesionRequests || isLoadingSfd ? (
            <div className="flex justify-center py-8">
              <Loader size="lg" />
            </div>
          ) : sfdError ? (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">SFD non disponible</AlertTitle>
              <AlertDescription className="text-red-700 space-y-4">
                <p>{sfdError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 bg-white text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => navigate('/mobile-flow/account')}
                >
                  Retour au compte
                </Button>
              </AlertDescription>
            </Alert>
          ) : existingRequest ? (
            <div>
              {existingRequest.status === 'pending' && (
                <Alert className="bg-amber-50 border-amber-200">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Demande en attente</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    <p>Votre demande d'adhésion est en cours d'examen.</p> 
                    <p className="mt-1 text-sm">Soumise le {formatDate(existingRequest.created_at)}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 bg-white text-amber-600 border-amber-300 hover:bg-amber-50"
                      onClick={() => navigate('/mobile-flow/account')}
                    >
                      Voir mes demandes
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {existingRequest.status === 'approved' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Demande approuvée</AlertTitle>
                  <AlertDescription className="text-green-700">
                    <p>Votre demande d'adhésion a été approuvée. Vous pouvez maintenant accéder aux services de la SFD.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 bg-white text-green-600 border-green-300 hover:bg-green-50"
                      onClick={() => navigate('/mobile-flow/main')}
                    >
                      Accéder à la SFD
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {existingRequest.status === 'rejected' && (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Demande rejetée</AlertTitle>
                  <AlertDescription className="text-red-700">
                    <p>Votre demande d'adhésion a été rejetée.</p>
                    {existingRequest.notes && (
                      <div className="mt-2 p-2 bg-white/50 rounded-md">
                        <strong>Raison du rejet:</strong> {existingRequest.notes}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            sfdInfo ? (
              <NewAdhesionRequestForm 
                sfdId={sfdId} 
                onSuccess={() => {
                  toast({
                    title: "Demande envoyée",
                    description: "Votre demande d'adhésion a été envoyée avec succès"
                  });
                  refetchUserAdhesionRequests();
                }}
              />
            ) : (
              <Alert>
                <AlertTitle>Impossible de charger la SFD</AlertTitle>
                <AlertDescription>
                  Impossible de charger les informations de cette SFD. Veuillez réessayer ultérieurement.
                </AlertDescription>
              </Alert>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdAdhesionPage;

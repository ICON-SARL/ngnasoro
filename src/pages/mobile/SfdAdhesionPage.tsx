import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, CheckCircle, XCircle, Building, Edit2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { NewAdhesionRequestForm } from '@/components/client/NewAdhesionRequestForm';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader } from '@/components/ui/loader';
import { formatDate } from '@/utils/formatters';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

const SfdAdhesionPage: React.FC = () => {
  const { sfdId } = useParams<{ sfdId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    adhesionRequests, 
    isLoadingAdhesionRequests,
    refetchAdhesionRequests 
  } = useClientAdhesions();
  
  const [sfdInfo, setSfdInfo] = useState<{ name: string; region?: string } | null>(null);
  const [isLoadingSfd, setIsLoadingSfd] = useState(false);
  const [sfdError, setSfdError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);
  
  // Check if we're in edit mode from the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    console.log('URL mode parameter:', mode);
    setIsEditMode(mode === 'edit');
  }, [location.search]);
  
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
    
    const fetchExistingRequest = async () => {
      if (!sfdId || !user?.id) return;
      
      try {
        console.log('Fetching existing request for SFD:', sfdId, 'and user:', user.id);
        const { data, error } = await supabase
          .from('client_adhesion_requests')
          .select('*')
          .eq('sfd_id', sfdId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching existing request:', error);
          return;
        }
        
        if (data) {
          console.log('Existing request found:', data);
          setExistingData(data);
        } else {
          console.log('No existing request found');
        }
      } catch (error) {
        console.error('Error in fetchExistingRequest:', error);
      }
    };
    
    fetchSfdInfo();
    fetchExistingRequest();
    refetchAdhesionRequests();
  }, [sfdId, toast, refetchAdhesionRequests, navigate, user]);

  // Recherche de la demande d'adhésion existante dans les adhésions
  const existingRequest = adhesionRequests.find(
    request => request.sfd_id === sfdId && request.user_id === user?.id
  );

  // useRealtimeSync hook to listen for changes to the client_adhesion_requests table
  useRealtimeSync({
    table: 'client_adhesion_requests',
    filter: sfdId ? `sfd_id=eq.${sfdId}` : undefined,
    onUpdate: (updatedRequest) => {
      if (updatedRequest.user_id === user?.id) {
        console.log('Adhesion request updated:', updatedRequest);
        refetchAdhesionRequests();
        
        // Notifications pour les changements de statut
        if (updatedRequest.status === 'approved') {
          toast({
            title: "Demande approuvée",
            description: "Votre demande d'adhésion a été approuvée",
          });
        } else if (updatedRequest.status === 'rejected') {
          toast({
            title: "Demande rejetée",
            description: updatedRequest.rejection_reason || "Votre demande d'adhésion a été rejetée",
            variant: "destructive"
          });
        }
      }
    }
  });

  const handleBackClick = () => {
    navigate('/mobile-flow/sfd-selector');
  };

  if (!sfdId) {
    return (
      <div className="container max-w-md mx-auto py-4 px-4">
        <Button variant="ghost" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <Alert className="mt-4">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Identifiant SFD manquant</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container max-w-md mx-auto py-4 px-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={handleBackClick}
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
              <>
                {isEditMode ? 'Modification de la demande' : 'Demande d\'adhésion'} 
                {sfdInfo && <span className="text-[#0D6A51]"> {sfdInfo.name}</span>}
              </>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pb-6">
          {isLoadingAdhesionRequests || isLoadingSfd ? (
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
                  onClick={handleBackClick}
                >
                  Retour à la liste
                </Button>
              </AlertDescription>
            </Alert>
          ) : existingRequest && !isEditMode ? (
            <div>
              {existingRequest.status === 'pending' && (
                <Alert className="bg-amber-50 border-amber-200">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">Demande en attente</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    <p>Votre demande d'adhésion est en cours d'examen.</p> 
                    <p className="mt-1 text-sm">Soumise le {formatDate(existingRequest.created_at)}</p>
                    <div className="mt-3 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white text-amber-600 border-amber-300 hover:bg-amber-50"
                        onClick={() => navigate('/mobile-flow/account')}
                      >
                        Voir mes demandes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                        onClick={() => setIsEditMode(true)}
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Modifier
                      </Button>
                    </div>
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
                    <div className="mt-3 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="bg-white text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => setIsEditMode(true)}
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Modifier et réessayer
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            sfdInfo ? (
              <div>
                {isEditMode && existingRequest && (
                  <Alert className="mb-4 bg-blue-50 border-blue-200">
                    <Edit2 className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Mode modification</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Vous modifiez votre demande existante. Mettez à jour les informations nécessaires et soumettez à nouveau.
                    </AlertDescription>
                  </Alert>
                )}
                <NewAdhesionRequestForm 
                  sfdId={sfdId}
                  initialData={existingData}
                  isEdit={isEditMode} 
                  onSuccess={() => {
                    toast({
                      title: isEditMode ? "Demande mise à jour" : "Demande envoyée",
                      description: isEditMode 
                        ? "Votre demande d'adhésion a été mise à jour avec succès" 
                        : "Votre demande d'adhésion a été envoyée avec succès"
                    });
                    refetchAdhesionRequests();
                    if (isEditMode) {
                      setIsEditMode(false);
                    }
                    navigate('/mobile-flow/sfd-selector');
                  }}
                />
              </div>
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

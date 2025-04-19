import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { NewAdhesionRequestForm } from '@/components/client/NewAdhesionRequestForm';
import { useSfdAdhesionRequests } from '@/hooks/useSfdAdhesionRequests';
import { supabase } from '@/integrations/supabase/client';

const SfdAdhesionForm: React.FC = () => {
  const { sfdId } = useParams<{ sfdId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isSubmitting } = useSfdAdhesionRequests();
  
  const [sfdInfo, setSfdInfo] = useState<{ name: string; code?: string; region?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  
  // Check if we're in edit mode from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const isEditMode = searchParams.get('mode') === 'edit';
  
  // Get state data passed from previous page, if any
  const locationState = location.state as { sfdId?: string; sfdName?: string } | null;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // If we have state data with SFD info, use it
        if (locationState?.sfdName && locationState?.sfdId === sfdId) {
          setSfdInfo({
            name: locationState.sfdName,
            // We don't have code/region in the state, but that's OK
          });
        } else {
          // Otherwise fetch the SFD info from the database
          const { data: sfdData, error: sfdError } = await supabase
            .from('sfds')
            .select('name, code, region')
            .eq('id', sfdId)
            .single();
            
          if (sfdError) throw sfdError;
          setSfdInfo(sfdData);
        }
        
        // Check if the user already has a request for this SFD
        if (user) {
          const { data: requestData, error: requestError } = await supabase
            .from('client_adhesion_requests')
            .select('*')
            .eq('user_id', user.id)
            .eq('sfd_id', sfdId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (requestError) throw requestError;
          
          if (requestData) {
            setExistingRequest(requestData);
            
            // If not in edit mode and the request exists with status other than 'rejected',
            // inform user and redirect
            if (!isEditMode && requestData.status !== 'rejected') {
              toast({
                title: "Demande existante",
                description: `Vous avez déjà une demande ${requestData.status === 'approved' ? 'approuvée' : 'en cours'} pour cette SFD.`,
              });
              navigate('/mobile-flow/main');
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching SFD data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations de la SFD",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (sfdId) {
      fetchData();
    }
  }, [sfdId, user, toast, navigate, isEditMode, locationState]);
  
  const handleFormSuccess = () => {
    toast({
      title: isEditMode ? "Demande mise à jour" : "Demande envoyée",
      description: isEditMode 
        ? "Votre demande a été mise à jour avec succès." 
        : "Votre demande d'adhésion a été soumise avec succès.",
    });
    
    // Redirect to main page after success
    setTimeout(() => {
      navigate('/mobile-flow/main');
    }, 1500);
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-md p-4 flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!sfdInfo) {
    return (
      <div className="container mx-auto max-w-md p-4">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">SFD non trouvée</p>
            <Button onClick={() => navigate('/mobile-flow/sfd-selector')}>
              Retour à la sélection de SFD
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-md p-4">
      <Button variant="ghost" onClick={handleGoBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{sfdInfo.name}</CardTitle>
              {(sfdInfo.region || sfdInfo.code) && (
                <p className="text-sm text-muted-foreground">{sfdInfo.region || sfdInfo.code}</p>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mt-2 mb-5">
            <h2 className="font-medium text-lg">
              {isEditMode ? "Modifier votre demande d'adhésion" : "Nouvelle demande d'adhésion"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditMode 
                ? "Mettez à jour les informations de votre demande ci-dessous." 
                : "Veuillez remplir le formulaire ci-dessous pour soumettre votre demande d'adhésion."}
            </p>
          </div>
          
          <NewAdhesionRequestForm
            sfdId={sfdId || ''}
            onSuccess={handleFormSuccess}
            initialData={isEditMode ? existingRequest : undefined}
            isEdit={isEditMode}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdAdhesionForm;

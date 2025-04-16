
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AdhesionRequestForm from '@/components/mobile/sfd/AdhesionRequestForm';
import { useSfdAdhesionRequests } from '@/hooks/useSfdAdhesionRequests';

export default function SfdAdhesionFormPage() {
  const { sfdId } = useParams<{ sfdId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitAdhesionRequest, isSubmitting } = useSfdAdhesionRequests();
  
  const [sfdInfo, setSfdInfo] = useState<{ name: string; region?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSfdInfo = async () => {
      if (!sfdId) {
        setError("ID de la SFD manquant");
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('sfds')
          .select('name, region')
          .eq('id', sfdId)
          .eq('status', 'active')
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setSfdInfo(data);
        } else {
          setError("SFD non trouvée ou inactive");
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération des informations SFD:", err);
        setError(err.message || "Erreur lors de la récupération des informations SFD");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSfdInfo();
  }, [sfdId]);
  
  const handleSubmit = async (formData: any) => {
    if (!sfdId) return;
    
    const result = await submitAdhesionRequest(sfdId, formData);
    
    if (result.success) {
      // Rediriger vers la page de compte après 1.5 secondes
      setTimeout(() => {
        navigate('/mobile-flow/account');
      }, 1500);
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto max-w-md p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Non autorisé</AlertTitle>
          <AlertDescription>
            Vous devez être connecté pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
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
          Adhésion SFD
        </h1>
        <div className="w-10"></div>
      </header>
      
      <main className="container mx-auto max-w-md p-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Building className="h-5 w-5 mr-2 text-[#0D6A51]" />
              {isLoading ? (
                <span>Chargement...</span>
              ) : (
                <>Rejoindre {sfdInfo?.name}</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#0D6A51]" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>
                  {error}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate('/mobile-flow/account')}
                  >
                    Retour au compte
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <AdhesionRequestForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                sfdName={sfdInfo?.name}
                defaultValues={{
                  full_name: user?.user_metadata?.full_name || '',
                  email: user?.email || '',
                }}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

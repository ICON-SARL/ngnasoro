
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { NewAdhesionRequestForm } from '@/components/client/NewAdhesionRequestForm';
import { useToast } from '@/hooks/use-toast';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';

const SfdAdhesionFormPage: React.FC = () => {
  const { sfdId } = useParams<{ sfdId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submitAdhesionRequest } = useClientAdhesions();

  const handleSuccess = () => {
    toast({
      title: "Demande envoyée",
      description: "Votre demande d'adhésion a été envoyée avec succès"
    });
    
    // Rediriger vers la page du compte
    navigate('/mobile-flow/account');
  };
  
  return (
    <div className="container max-w-md mx-auto py-4 px-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>
      
      {sfdId ? (
        <NewAdhesionRequestForm 
          sfdId={sfdId} 
          onSuccess={handleSuccess}
        />
      ) : (
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-600">
            Identifiant SFD manquant. Impossible de traiter votre demande.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/mobile-flow/account')}
          >
            Retour au compte
          </Button>
        </div>
      )}
    </div>
  );
};

export default SfdAdhesionFormPage;

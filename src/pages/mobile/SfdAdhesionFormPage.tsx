
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SfdAdhesionFormPage: React.FC = () => {
  const { sfdId } = useParams<{ sfdId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoBack = () => {
    navigate('/mobile-flow/account');
  };
  
  return (
    <div className="container max-w-md mx-auto py-4 px-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={handleGoBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Demande d'adhésion</h2>
            <p className="text-gray-600 mb-6">
              Cette fonctionnalité a été désactivée. Pour devenir client d'une SFD, veuillez contacter directement l'institution de votre choix.
            </p>
            <Button 
              onClick={handleGoBack}
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              Retour au compte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdAdhesionFormPage;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import MobileLoanApplicationForm from '@/components/mobile/loan/MobileLoanApplicationForm';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';
import { useAuth } from '@/hooks/useAuth';

const MobileLoanApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isLoading, data: loanPlans } = useSfdLoanPlans();
  
  // Redirect if user is not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Handle back button press
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#0D6A51] text-white p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white mr-2" 
            onClick={handleBack}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold">Demande de Prêt</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow mb-4 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Informations sur le Prêt</h2>
          <p className="text-sm text-gray-600">
            Veuillez remplir le formulaire ci-dessous pour soumettre votre demande de prêt. 
            Tous les champs marqués d'un astérisque (*) sont obligatoires.
          </p>
        </div>

        <MobileLoanApplicationForm />
      </div>
    </div>
  );
};

export default MobileLoanApplicationPage;

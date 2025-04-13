
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MobileLoanApplicationForm from '@/components/mobile/loan/MobileLoanApplicationForm';

const MobileLoanApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2 p-0" 
          onClick={() => navigate('/mobile-flow/loans')}
        >
          ←
        </Button>
        <div>
          <h1 className="text-xl font-bold">Demande de prêt</h1>
          <p className="text-gray-500 text-sm">Remplissez le formulaire ci-dessous</p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="bg-blue-50 p-4 rounded-lg text-sm mb-6">
          <p>
            Remplissez le formulaire ci-dessous pour soumettre votre demande de prêt. 
            Une fois approuvée, vous recevrez une notification et pourrez suivre le statut dans la section "Mes prêts".
          </p>
        </div>
        
        <MobileLoanApplicationForm />
      </div>
    </div>
  );
};

export default MobileLoanApplicationPage;

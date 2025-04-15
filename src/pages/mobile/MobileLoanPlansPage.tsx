
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LoanPlansDisplay from '@/components/mobile/loan/LoanPlansDisplay';

const MobileLoanPlansPage: React.FC = () => {
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
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Plans de prêt</h1>
          <p className="text-gray-500 text-sm">Découvrez nos offres de financement</p>
        </div>
      </div>
      
      <div className="p-4">
        {/* Section pour les prêts standards */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Prêts standards</h2>
          <LoanPlansDisplay />
        </div>
        
        {/* Section pour les prêts subventionnés */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Prêts subventionnés</h2>
          <LoanPlansDisplay subsidizedOnly={true} />
        </div>
      </div>
    </div>
  );
};

export default MobileLoanPlansPage;

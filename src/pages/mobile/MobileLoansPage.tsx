
import React from 'react';
import MobileNavigation from '@/components/MobileNavigation';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import LoanPlansDisplay from '@/components/mobile/loan/LoanPlansDisplay';

const MobileLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">Plans de Prêt</h1>
        <p className="text-gray-500 text-sm">Découvrez nos offres de financement</p>
      </div>
      
      <div className="p-4">
        {/* Affichage des plans de prêt disponibles */}
        <div className="mb-6">
          <LoanPlansDisplay />
        </div>
        
        <div className="mt-8 mb-4 flex justify-center">
          <Button 
            onClick={() => navigate('/mobile-flow/my-loans')}
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 flex items-center gap-2"
          >
            Voir mes prêts
          </Button>
        </div>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileLoansPage;

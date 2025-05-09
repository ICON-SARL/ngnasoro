
import React from 'react';
import MobileNavigation from '@/components/MobileNavigation';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, CreditCard } from 'lucide-react';
import SfdLoanPlansTable from '@/components/mobile/loan/SfdLoanPlansTable';

const MobileLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">Plans de Prêt</h1>
        <p className="text-gray-500 text-sm">Découvrez nos offres de financement</p>
      </div>
      
      <div className="p-4">
        {/* Affichage des plans de prêt disponibles */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Plans disponibles</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#0D6A51] flex items-center"
              onClick={() => navigate('/mobile-flow/loan-plans')}
            >
              Tout voir <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <SfdLoanPlansTable sfdId={activeSfdId} />
        </div>
        
        <div className="mt-8 mb-4 flex justify-center">
          <Button 
            onClick={() => navigate('/mobile-flow/loan-application')}
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Faire une demande de prêt
          </Button>
        </div>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileLoansPage;

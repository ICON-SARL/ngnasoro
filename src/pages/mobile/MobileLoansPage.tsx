
import React, { useEffect, useState } from 'react';
import MobileNavigation from '@/components/MobileNavigation';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import SfdLoanPlansTable from '@/components/mobile/loan/SfdLoanPlansTable';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const MobileLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const [sfdName, setSfdName] = useState<string>('votre SFD');
  const { data: plans = [], isLoading, error } = useSfdLoanPlans();

  useEffect(() => {
    // Si des plans sont disponibles, récupérer le nom de la SFD du premier plan
    if (plans && plans.length > 0 && plans[0].sfds) {
      setSfdName(plans[0].sfds.name || 'votre SFD');
    }
  }, [plans]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">Plans de Prêt</h1>
        <p className="text-gray-500 text-sm">Découvrez nos offres de financement</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 text-[#0D6A51] animate-spin" />
          <span className="ml-2 text-gray-600">Chargement des plans...</span>
        </div>
      ) : error ? (
        <div className="p-4 my-4 bg-red-50 border border-red-200 rounded-md text-center">
          <p className="text-red-600">Impossible de charger les plans de prêt</p>
        </div>
      ) : (
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
            
            {plans.length === 0 ? (
              <div className="border rounded-md p-6 bg-white text-center">
                <p className="text-gray-500 mb-2">Aucun plan de prêt disponible pour le moment</p>
                <p className="text-sm text-gray-400">Les plans de prêt apparaîtront ici une fois publiés par {sfdName}</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                  <h3 className="font-medium text-blue-800">Plans de {sfdName}</h3>
                  <p className="text-sm text-blue-600 mt-1">
                    {plans.length} plan{plans.length > 1 ? 's' : ''} de prêt disponible{plans.length > 1 ? 's' : ''}
                  </p>
                </div>
                <SfdLoanPlansTable sfdId={activeSfdId} />
              </>
            )}
          </div>
          
          <Separator className="my-6" />
          
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
      )}
      
      <MobileNavigation />
    </div>
  );
};

export default MobileLoansPage;

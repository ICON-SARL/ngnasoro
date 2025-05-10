
import React, { useEffect, useState } from 'react';
import MobileNavigation from '@/components/MobileNavigation';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, CreditCard, Loader2, List, Search } from 'lucide-react';
import SfdLoanPlansTable from '@/components/mobile/loan/SfdLoanPlansTable';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const MobileLoansPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const [sfdName, setSfdName] = useState<string>('votre SFD');
  const { data: plans = [], isLoading, error } = useSfdLoanPlans();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered plans based on search term
  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    plan.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            type="text"
            placeholder="Rechercher un plan de prêt..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 text-[#0D6A51] animate-spin" />
          <span className="ml-2 text-gray-600">Chargement des plans...</span>
        </div>
      ) : error ? (
        <div className="p-4 my-4 bg-red-50 border border-red-200 rounded-md text-center">
          <p className="text-red-600">Impossible de charger les plans de prêt</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Réessayer
          </Button>
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
            
            {filteredPlans.length === 0 ? (
              <Card className="border rounded-md shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500 mb-2">Aucun plan de prêt disponible{searchTerm ? " pour cette recherche" : ""}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {searchTerm ? 
                      "Essayez avec d'autres termes de recherche" : 
                      `Les plans de prêt apparaîtront ici une fois publiés par ${sfdName}`
                    }
                  </p>
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSearchTerm('')}
                      className="mt-4"
                    >
                      Effacer la recherche
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                  <h3 className="font-medium text-blue-800">Plans de {sfdName}</h3>
                  <p className="text-sm text-blue-600 mt-1">
                    {filteredPlans.length} plan{filteredPlans.length > 1 ? 's' : ''} de prêt disponible{filteredPlans.length > 1 ? 's' : ''}
                  </p>
                </div>
                <SfdLoanPlansTable sfdId={activeSfdId} />
              </>
            )}
          </div>
          
          <Separator className="my-6" />
          
          <div className="mt-8 mb-4 flex gap-3 justify-center">
            <Button 
              variant="outline"
              onClick={() => navigate('/mobile-flow/my-loans')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Mes prêts
            </Button>
            
            <Button 
              onClick={() => navigate('/mobile-flow/loan-application')}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Faire une demande
            </Button>
          </div>
        </div>
      )}
      
      <MobileNavigation />
    </div>
  );
};

export default MobileLoansPage;

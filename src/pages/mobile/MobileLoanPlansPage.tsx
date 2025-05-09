
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import SfdLoanPlansTable from '@/components/mobile/loan/SfdLoanPlansTable';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';

const MobileLoanPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeSfdId } = useAuth();
  const [activeTab, setActiveTab] = useState('standard');
  const { data: plans = [], isLoading, error } = useSfdLoanPlans();
  
  // Compter les plans standards et subventionnés
  const standardPlans = plans.filter(plan => 
    !(plan.name.toLowerCase().includes('subvention') || 
    plan.description?.toLowerCase().includes('subvention'))
  ).length;
  
  const subsidizedPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes('subvention') || 
    plan.description?.toLowerCase().includes('subvention')
  ).length;
  
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
          <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="standard">
                Prêts standards ({standardPlans})
              </TabsTrigger>
              <TabsTrigger value="subsidized">
                Prêts subventionnés ({subsidizedPlans})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="mt-0">
              <SfdLoanPlansTable sfdId={activeSfdId} />
            </TabsContent>

            <TabsContent value="subsidized" className="mt-0">
              <div className="bg-amber-50 p-4 rounded-lg mb-4 border border-amber-200">
                <h3 className="font-medium text-amber-800">Prêts subventionnés</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Les prêts subventionnés bénéficient d'un taux d'intérêt réduit grâce à une subvention de l'État ou d'un partenaire.
                </p>
              </div>
              <SfdLoanPlansTable sfdId={activeSfdId} />
            </TabsContent>
          </Tabs>
        )}
        
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
          <Button 
            onClick={() => navigate('/mobile-flow/loan-application')}
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Faire une demande de prêt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileLoanPlansPage;

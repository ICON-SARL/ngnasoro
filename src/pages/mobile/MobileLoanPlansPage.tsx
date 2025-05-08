
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoanPlansDisplay from '@/components/mobile/loan/LoanPlansDisplay';
import { useAuth } from '@/hooks/useAuth';

const MobileLoanPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeSfdId } = useAuth();
  const [activeTab, setActiveTab] = useState('standard');
  
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
        <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="standard">Prêts standards</TabsTrigger>
            <TabsTrigger value="subsidized">Prêts subventionnés</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="mt-0">
            <LoanPlansDisplay sfdId={activeSfdId} />
          </TabsContent>

          <TabsContent value="subsidized" className="mt-0">
            <div className="bg-amber-50 p-4 rounded-lg mb-4 border border-amber-200">
              <h3 className="font-medium text-amber-800">Prêts subventionnés</h3>
              <p className="text-sm text-amber-700 mt-1">
                Les prêts subventionnés bénéficient d'un taux d'intérêt réduit grâce à une subvention de l'État ou d'un partenaire.
              </p>
            </div>
            <LoanPlansDisplay subsidizedOnly={true} sfdId={activeSfdId} />
          </TabsContent>
        </Tabs>
        
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

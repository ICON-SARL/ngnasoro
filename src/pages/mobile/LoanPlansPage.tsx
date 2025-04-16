
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoanPlansDisplay from '@/components/mobile/loan/LoanPlansDisplay';

const LoanPlansPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/mobile-flow/loans')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Plans de prêt</h1>
      </div>

      <div className="p-4">
        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="standard">Prêts standards</TabsTrigger>
            <TabsTrigger value="subsidized">Prêts subventionnés</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="mt-0">
            <LoanPlansDisplay />
          </TabsContent>

          <TabsContent value="subsidized" className="mt-0">
            <div className="bg-amber-50 p-4 rounded-lg mb-4 border border-amber-200">
              <h3 className="font-medium text-amber-800">Prêts subventionnés</h3>
              <p className="text-sm text-amber-700 mt-1">
                Les prêts subventionnés bénéficient d'un taux d'intérêt réduit grâce à une subvention de l'État ou d'un partenaire.
              </p>
            </div>
            <LoanPlansDisplay subsidizedOnly={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoanPlansPage;

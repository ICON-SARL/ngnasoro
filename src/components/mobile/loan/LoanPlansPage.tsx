
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, ChevronRight, Calculator } from 'lucide-react';
import LoanPlansDisplay from './LoanPlansDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const LoanPlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showRepaymentSchedule, setShowRepaymentSchedule] = useState(false);
  
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
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">Prêts disponibles</h2>
          <p className="text-gray-600 text-sm">
            Consultez les plans de prêt proposés par les SFD et choisissez celui qui correspond à vos besoins.
          </p>
        </div>
        
        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="public">Prêts standards</TabsTrigger>
            <TabsTrigger value="subsidized">Prêts subventionnés</TabsTrigger>
          </TabsList>
          
          <TabsContent value="public" className="mt-0">
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
        
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
          <Button 
            onClick={() => navigate('/mobile-flow/loan-application')}
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            Faire une demande de prêt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoanPlansPage;

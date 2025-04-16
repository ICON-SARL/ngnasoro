
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoanPlansDisplay from '../LoanPlansDisplay';

export const LoanPlansTabs = () => {
  return (
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
  );
};

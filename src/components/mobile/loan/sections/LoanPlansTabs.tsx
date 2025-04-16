
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LoanPlansDisplay from '../LoanPlansDisplay';

export const LoanPlansTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('standard');
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="standard" className="flex-1">Standards</TabsTrigger>
        <TabsTrigger value="subsidized" className="flex-1">Subventionnés</TabsTrigger>
      </TabsList>
      
      <TabsContent value="standard">
        <LoanPlansDisplay />
      </TabsContent>
      
      <TabsContent value="subsidized">
        <LoanPlansDisplay subsidizedOnly={true} />
      </TabsContent>
    </Tabs>
  );
};

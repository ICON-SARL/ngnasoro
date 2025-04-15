
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoanPlanManagement } from './LoanPlanManagement';
import LoanList from './loans/LoanList';
import LoanPlanDialog from './LoanPlanDialog';
import LoanWorkflow from './loans/LoanWorkflow';

export function LoanManagement() {
  const [activeTab, setActiveTab] = useState('plans');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<any | null>(null);

  const handleNewPlan = () => {
    setPlanToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: any) => {
    setPlanToEdit(plan);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="plans">Plans de Prêt</TabsTrigger>
          <TabsTrigger value="applications">Demandes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans" className="space-y-4 mt-6">
          <LoanPlanManagement 
            onNewPlan={handleNewPlan} 
            onEditPlan={handleEditPlan}
          />
        </TabsContent>
        
        <TabsContent value="applications" className="space-y-4 mt-6">
          <LoanWorkflow />
        </TabsContent>
      </Tabs>
      
      <LoanPlanDialog 
        isOpen={isDialogOpen} 
        onClose={handleDialogClose} 
        onSaved={() => {
          handleDialogClose();
        }}
        planToEdit={planToEdit}
      />
    </div>
  );
}


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoanPlanManagement } from './LoanPlanManagement';
import LoanList from './loans/LoanList';
import LoanPlanDialog from './LoanPlanDialog';
import LoanWorkflow from './loans/LoanWorkflow';
import { useNavigate } from 'react-router-dom';

export function LoanManagement() {
  const [activeTab, setActiveTab] = useState('plans');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<any | null>(null);
  const navigate = useNavigate();

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

  const handleBackToDashboard = () => {
    navigate('/agency-dashboard');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBackToDashboard}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Tableau de bord
        </Button>
      </div>
      
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

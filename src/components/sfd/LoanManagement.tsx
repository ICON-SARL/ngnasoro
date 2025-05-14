
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { LoanWorkflow } from '@/components/sfd/loans';
import { LoanPlanManagement } from '@/components/sfd/LoanPlanManagement';
import { Plus } from 'lucide-react';
import NewLoanPlanDialog from '@/components/sfd/loans/NewLoanPlanDialog';
import EditLoanPlanDialog from '@/components/sfd/loans/EditLoanPlanDialog';

interface LoanManagementProps {
  onRefresh?: () => void;
}

export function LoanManagement({ onRefresh }: LoanManagementProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('loans');
  const [isNewPlanDialogOpen, setIsNewPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleNewPlanClick = () => {
    setIsNewPlanDialogOpen(true);
  };
  
  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
  };
  
  const handlePlanCreated = () => {
    setIsNewPlanDialogOpen(false);
    toast({
      title: 'Plan créé',
      description: 'Le plan de prêt a été créé avec succès',
    });
    // Refresh data
    if (onRefresh) onRefresh();
  };
  
  const handlePlanUpdated = () => {
    setEditingPlan(null);
    toast({
      title: 'Plan modifié',
      description: 'Le plan de prêt a été mis à jour avec succès',
    });
    // Refresh data
    if (onRefresh) onRefresh();
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="loans">Prêts</TabsTrigger>
          <TabsTrigger value="plans">Plans de Prêt</TabsTrigger>
        </TabsList>
        
        <TabsContent value="loans">
          <LoanWorkflow />
        </TabsContent>
        
        <TabsContent value="plans">
          <LoanPlanManagement 
            onNewPlan={handleNewPlanClick} 
            onEditPlan={handleEditPlan} 
          />
        </TabsContent>
      </Tabs>
      
      <NewLoanPlanDialog
        isOpen={isNewPlanDialogOpen}
        onClose={() => setIsNewPlanDialogOpen(false)}
        onPlanCreated={handlePlanCreated}
      />
      
      {editingPlan && (
        <EditLoanPlanDialog
          isOpen={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          onPlanUpdated={handlePlanUpdated}
          plan={editingPlan}
        />
      )}
    </div>
  );
}

export default LoanManagement;

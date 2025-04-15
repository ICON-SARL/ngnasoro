
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoanPlanManagement } from './LoanPlanManagement';
import LoanList from './loans/LoanList'; // Changed from named import to default import
import LoanPlanDialog from './LoanPlanDialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SfdActivationAlert } from './SfdActivationAlert';

export function LoanManagement() {
  const [activeTab, setActiveTab] = useState('plans');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<any | null>(null);
  const [sfdStatus, setSfdStatus] = useState<string>('active');
  const [sfdName, setSfdName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { activeSfdId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (activeSfdId) {
      checkSfdStatus();
    }
  }, [activeSfdId]);

  const checkSfdStatus = async () => {
    if (!activeSfdId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sfds')
        .select('status, name')
        .eq('id', activeSfdId)
        .single();
        
      if (error) throw error;
      
      setSfdStatus(data?.status || 'error');
      setSfdName(data?.name || '');
    } catch (error) {
      console.error('Error checking SFD status:', error);
      setSfdStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPlan = () => {
    if (sfdStatus !== 'active') {
      toast({
        title: "SFD inactive",
        description: "Veuillez activer la SFD avant de créer des plans de prêt",
        variant: "destructive",
      });
      return;
    }
    
    setPlanToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: any) => {
    if (sfdStatus !== 'active') {
      toast({
        title: "SFD inactive",
        description: "Veuillez activer la SFD avant de modifier des plans de prêt",
        variant: "destructive",
      });
      return;
    }
    
    setPlanToEdit(plan);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleSfdActivated = () => {
    checkSfdStatus();
    toast({
      title: "SFD activée",
      description: "La SFD a été activée avec succès",
    });
  };

  if (isLoading) {
    return <div className="p-4 text-center">Chargement des informations de la SFD...</div>;
  }

  const showActivationAlert = sfdStatus !== 'active' && activeSfdId;

  return (
    <div className="space-y-4">
      {showActivationAlert && (
        <SfdActivationAlert 
          sfdId={activeSfdId || ''} 
          sfdName={sfdName}
          status={sfdStatus}
          onActivate={handleSfdActivated}
        />
      )}
      
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
          <LoanList />
        </TabsContent>
      </Tabs>
      
      <LoanPlanDialog 
        isOpen={isDialogOpen} 
        onClose={handleDialogClose} 
        onSaved={checkSfdStatus}
        planToEdit={planToEdit}
      />
    </div>
  );
}

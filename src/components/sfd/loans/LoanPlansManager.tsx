
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Check, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LoanPlanDialog from './LoanPlanDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface LoanPlan {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  requirements: string[];
  is_active: boolean;
}

const LoanPlansManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    fetchLoanPlans();
  }, [user]);
  
  const fetchLoanPlans = async () => {
    if (!user?.sfd_id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', user.sfd_id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setLoanPlans(data || []);
    } catch (error) {
      console.error('Error fetching loan plans:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans de prêt",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (plan: LoanPlan | null = null) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setSelectedPlan(null);
    setIsDialogOpen(false);
  };
  
  const handleSaved = () => {
    fetchLoanPlans();
  };
  
  const confirmDelete = (planId: string) => {
    setPlanToDelete(planId);
  };
  
  const closeDeleteDialog = () => {
    setPlanToDelete(null);
  };
  
  const handleDelete = async () => {
    if (!planToDelete) return;
    
    try {
      const { error } = await supabase
        .from('sfd_loan_plans')
        .delete()
        .eq('id', planToDelete);
        
      if (error) throw error;
      
      toast({
        title: "Plan supprimé",
        description: "Le plan de prêt a été supprimé avec succès",
      });
      
      fetchLoanPlans();
    } catch (error) {
      console.error('Error deleting loan plan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le plan de prêt",
        variant: "destructive",
      });
    } finally {
      closeDeleteDialog();
    }
  };
  
  const handleToggleActive = async (plan: LoanPlan) => {
    try {
      const { error } = await supabase
        .from('sfd_loan_plans')
        .update({
          is_active: !plan.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id);
        
      if (error) throw error;
      
      toast({
        title: plan.is_active ? "Plan désactivé" : "Plan activé",
        description: plan.is_active 
          ? "Le plan de prêt n'est plus disponible" 
          : "Le plan de prêt est maintenant disponible",
      });
      
      fetchLoanPlans();
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du plan",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Plans de Prêt</h2>
          <p className="text-sm text-muted-foreground">
            Configurez les différents types de prêts proposés par votre SFD
          </p>
        </div>
        
        <Button onClick={() => handleOpenDialog()} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Plan
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : loanPlans.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-muted-foreground mb-4">Aucun plan de prêt configuré</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loanPlans.map((plan) => (
            <Card key={plan.id} className={!plan.is_active ? 'opacity-70' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {plan.is_active ? (
                    <Badge className="bg-green-100 text-green-800">Actif</Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">Inactif</Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-1">Montant</h4>
                  <p className="text-sm">{plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Durée</h4>
                  <p className="text-sm">{plan.min_duration} - {plan.max_duration} mois</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Taux d'intérêt</h4>
                    <p className="text-sm">{plan.interest_rate}%</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Frais</h4>
                    <p className="text-sm">{plan.fees}%</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Documents requis</h4>
                  {plan.requirements && plan.requirements.length > 0 ? (
                    <ul className="text-sm pl-5 list-disc">
                      {plan.requirements.slice(0, 3).map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                      {plan.requirements.length > 3 && (
                        <li>+{plan.requirements.length - 3} autres</li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun document requis</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(plan)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(plan)}
                    className={plan.is_active ? "text-red-500" : "text-green-500"}
                  >
                    {plan.is_active ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Désactiver
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Activer
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-500"
                    onClick={() => confirmDelete(plan.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create/Edit Dialog */}
      <LoanPlanDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSaved={handleSaved}
        planToEdit={selectedPlan}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!planToDelete} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le plan de prêt sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LoanPlansManager;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, ToggleLeft, ToggleRight, Send, CheckCircle2 } from 'lucide-react';
import { LoanPlan } from '@/types/sfdClients';

interface LoanPlanManagementProps {
  onNewPlan: () => void;
  onEditPlan: (plan: LoanPlan) => void;
}

export function LoanPlanManagement({ onNewPlan, onEditPlan }: LoanPlanManagementProps) {
  const { toast } = useToast();
  const { activeSfdId } = useAuth();
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);

  useEffect(() => {
    if (activeSfdId) {
      fetchLoanPlans();
    }
  }, [activeSfdId]);

  const fetchLoanPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', activeSfdId);

      if (error) throw error;
      
      const typedPlans = (data || []).map(plan => ({
        ...plan,
        is_published: Boolean(plan.is_published),
        is_active: Boolean(plan.is_active),
        requirements: plan.requirements || []
      })) as LoanPlan[];
      
      setLoanPlans(typedPlans);
    } catch (error) {
      console.error('Error fetching loan plans:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans de prêt",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlanStatus = async (plan: LoanPlan) => {
    try {
      const { error } = await supabase
        .from('sfd_loan_plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);

      if (error) throw error;
      
      toast({
        title: plan.is_active ? "Plan désactivé" : "Plan activé",
        description: `Le plan "${plan.name}" a été ${plan.is_active ? 'désactivé' : 'activé'}`
      });
      
      fetchLoanPlans();
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du plan",
        variant: "destructive"
      });
    }
  };

  const publishPlan = async (plan: LoanPlan) => {
    setIsPublishing(plan.id);
    try {
      const updateData: Partial<LoanPlan> = { is_published: true };
      
      const { error } = await supabase
        .from('sfd_loan_plans')
        .update(updateData)
        .eq('id', plan.id);

      if (error) throw error;
      
      const { data: sfdData } = await supabase
        .from('sfds')
        .select('name')
        .eq('id', activeSfdId)
        .single();
      
      await supabase.functions.invoke('loan-plan-notifications', {
        body: {
          sfd_id: activeSfdId,
          loan_plan_id: plan.id,
          loan_plan_name: plan.name,
          sfd_name: sfdData?.name || 'Votre SFD'
        }
      });
      
      toast({
        title: "Plan publié",
        description: `Le plan "${plan.name}" a été publié avec succès et les clients ont été notifiés.`
      });
      
      fetchLoanPlans();
    } catch (error) {
      console.error('Error publishing plan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier le plan",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plans de Prêt</h2>
        <Button onClick={onNewPlan} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
          <Plus className="mr-2 h-4 w-4" /> Nouveau Plan
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-6">Chargement des plans de prêt...</div>
          ) : loanPlans.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Aucun plan de prêt défini. Créez votre premier plan pour commencer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Taux</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Publication</TableHead>
                  <TableHead className="w-[130px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loanPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {plan.name}
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {plan.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(plan.min_amount)} - {formatCurrency(plan.max_amount)}
                    </TableCell>
                    <TableCell>
                      {plan.min_duration} - {plan.max_duration} mois
                    </TableCell>
                    <TableCell>{plan.interest_rate}%</TableCell>
                    <TableCell>
                      {plan.is_active ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300">
                          Inactif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.is_published ? (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Publié
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200">
                          Non publié
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onEditPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => togglePlanStatus(plan)}
                        >
                          {plan.is_active ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        {plan.is_active && !plan.is_published && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => publishPlan(plan)}
                            disabled={isPublishing === plan.id}
                          >
                            <Send className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LoanPlanManagement;

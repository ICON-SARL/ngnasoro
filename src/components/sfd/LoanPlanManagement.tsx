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
import { Plus, Edit, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react';

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
  is_active: boolean;
  is_published: boolean;
  requirements: string[];
  sfd_id: string;
}

interface LoanPlanManagementProps {
  onNewPlan: () => void;
  onEditPlan: (plan: LoanPlan) => void;
}

export function LoanPlanManagement({ onNewPlan, onEditPlan }: LoanPlanManagementProps) {
  const { toast } = useToast();
  const { activeSfdId } = useAuth();
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setLoanPlans(data || []);
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

  const togglePlanPublication = async (plan: LoanPlan) => {
    try {
      const { error } = await supabase
        .from('sfd_loan_plans')
        .update({ is_published: !plan.is_published })
        .eq('id', plan.id);

      if (error) throw error;
      
      toast({
        title: plan.is_published ? "Plan retiré" : "Plan publié",
        description: `Le plan "${plan.name}" a été ${plan.is_published ? 'retiré de la publication' : 'publié'}`
      });
      
      fetchLoanPlans();
    } catch (error) {
      console.error('Error toggling plan publication:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la publication du plan",
        variant: "destructive"
      });
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
                  <TableHead className="w-[100px]">Actions</TableHead>
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
                          Publié
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300">
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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => togglePlanPublication(plan)}
                        >
                          {plan.is_published ? (
                            <Eye className="h-4 w-4 text-blue-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
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

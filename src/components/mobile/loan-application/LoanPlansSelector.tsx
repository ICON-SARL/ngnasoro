
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';

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
  sfd_id: string;
}

interface LoanPlansSelectorProps {
  sfdId: string;
  onSelectPlan: (plan: LoanPlan) => void;
  selectedPlanId: string;
}

const LoanPlansSelector: React.FC<LoanPlansSelectorProps> = ({ 
  sfdId, 
  onSelectPlan, 
  selectedPlanId 
}) => {
  const [plans, setPlans] = useState<LoanPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLoanPlans = async () => {
      if (!sfdId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('loan_plans')
          .select('*')
          .eq('sfd_id', sfdId)
          .eq('is_active', true)
          .order('name');
          
        if (error) throw error;
        
        setPlans(data || []);
        
        // Auto-select first plan if none selected
        if (data?.length && !selectedPlanId) {
          onSelectPlan(data[0]);
        }
      } catch (err) {
        console.error('Error fetching loan plans:', err);
        setError('Impossible de charger les plans de prêt. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLoanPlans();
  }, [sfdId, onSelectPlan, selectedPlanId]);
  
  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader size="lg" /></div>;
  }
  
  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }
  
  if (!plans.length) {
    return <div className="text-center p-4 text-muted-foreground">Aucun plan de prêt disponible pour cette SFD.</div>;
  }
  
  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`p-4 cursor-pointer transition-all border-2 ${
            selectedPlanId === plan.id 
              ? 'border-[#0D6A51] bg-[#0D6A51]/5 shadow-md' 
              : 'hover:border-[#0D6A51]/40'
          }`}
          onClick={() => onSelectPlan(plan)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-medium text-lg ${
                selectedPlanId === plan.id ? 'text-[#0D6A51]' : ''
              }`}>
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
            <Badge variant={selectedPlanId === plan.id ? "default" : "outline"} className="ml-2">
              {plan.interest_rate}% / an
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
            <div>
              <p className="text-muted-foreground">Montant:</p>
              <p>{plan.min_amount.toLocaleString('fr-FR')} - {plan.max_amount.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div>
              <p className="text-muted-foreground">Durée:</p>
              <p>{plan.min_duration} - {plan.max_duration} mois</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LoanPlansSelector;

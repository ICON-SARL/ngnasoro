
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calculator, Calendar, Percent } from 'lucide-react';

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
  selectedPlanId?: string;
}

const LoanPlansSelector: React.FC<LoanPlansSelectorProps> = ({ 
  sfdId, 
  onSelectPlan, 
  selectedPlanId 
}) => {
  const [plans, setPlans] = useState<LoanPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLoanPlans = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Important: Reset plans to empty array when sfdId changes to prevent stale data
        setPlans([]); 
        
        if (!sfdId) {
          setError('Aucune SFD sélectionnée');
          setPlans([]);
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .select('*')
          .eq('sfd_id', sfdId)
          .eq('is_active', true);
          
        if (error) throw error;
        
        // Ensure plans is always an array, even if data is null
        const plansData = Array.isArray(data) ? data : [];
        setPlans(plansData as LoanPlan[]);
        
        // Auto-select the first plan if none is selected and plans exist
        if (plansData.length > 0 && !selectedPlanId) {
          onSelectPlan(plansData[0] as LoanPlan);
        }
      } catch (err: any) {
        console.error('Error fetching loan plans:', err);
        setError('Impossible de charger les plans de prêt');
        setPlans([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLoanPlans();
  }, [sfdId, onSelectPlan, selectedPlanId]);

  const handleSelectPlan = (planId: string) => {
    const selectedPlan = plans.find(plan => plan.id === planId);
    if (selectedPlan) {
      onSelectPlan(selectedPlan);
    }
  };
  
  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-4">
          <Skeleton className="h-6 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          
          <div className="grid grid-cols-3 gap-4 mt-2">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="mt-4 border-amber-200">
        <CardContent className="pt-4 text-center">
          <p className="text-amber-600">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!plans || plans.length === 0) {
    return (
      <Card className="mt-4 border-gray-200">
        <CardContent className="pt-4 text-center">
          <p className="text-gray-500">Aucun plan de prêt disponible pour cette SFD</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <RadioGroup value={selectedPlanId} onValueChange={handleSelectPlan}>
      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="relative">
            <RadioGroupItem
              value={plan.id}
              id={plan.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={plan.id}
              className="flex flex-col p-4 border-2 rounded-lg cursor-pointer peer-data-[state=checked]:border-[#0D6A51] hover:bg-gray-50 peer-data-[state=checked]:bg-[#0D6A51]/5"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{plan.name}</span>
                <Badge variant="outline" className="bg-[#0D6A51]/10 text-[#0D6A51] border-0">
                  {plan.interest_rate}% p.a.
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                <div className="flex items-center">
                  <Calculator className="h-3 w-3 mr-1 text-[#0D6A51]" />
                  <span>{plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1 text-[#0D6A51]" />
                  <span>{plan.min_duration} - {plan.max_duration} mois</span>
                </div>
                <div className="flex items-center">
                  <Percent className="h-3 w-3 mr-1 text-[#0D6A51]" />
                  <span>Frais: {plan.fees}%</span>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
};

export default LoanPlansSelector;

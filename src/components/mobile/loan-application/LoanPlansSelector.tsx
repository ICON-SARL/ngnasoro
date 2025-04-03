
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
        
        if (!sfdId) {
          setError('Aucune SFD sélectionnée');
          return;
        }
        
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .select('*')
          .eq('sfd_id', sfdId)
          .eq('is_active', true);
          
        if (error) throw error;
        
        setPlans(data as LoanPlan[]);
        
        // Auto-select the first plan if none is selected and plans exist
        if (data.length > 0 && !selectedPlanId) {
          onSelectPlan(data[0] as LoanPlan);
        }
      } catch (err) {
        console.error('Error fetching loan plans:', err);
        setError('Impossible de charger les plans de prêt');
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
          <p className="text-sm text-gray-500 mt-2">
            Veuillez réessayer ou contacter votre SFD
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (plans.length === 0) {
    return (
      <Card className="mt-4 border-gray-200">
        <CardContent className="pt-4 text-center">
          <p className="text-gray-600">Aucun plan de prêt disponible pour cette SFD</p>
          <p className="text-sm text-gray-500 mt-2">
            Veuillez contacter votre SFD pour plus d'informations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardContent className="pt-4">
        <h3 className="font-medium mb-3">Plans de prêt disponibles</h3>
        
        <RadioGroup 
          value={selectedPlanId} 
          onValueChange={handleSelectPlan}
          className="space-y-3"
        >
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`border rounded-lg p-3 transition-colors ${
                selectedPlanId === plan.id 
                  ? 'border-[#0D6A51] bg-[#0D6A51]/5' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start">
                <RadioGroupItem 
                  value={plan.id} 
                  id={`plan-${plan.id}`} 
                  className="mt-1"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-start">
                    <Label 
                      htmlFor={`plan-${plan.id}`} 
                      className="font-medium text-base cursor-pointer"
                    >
                      {plan.name}
                    </Label>
                    {plan.requirements?.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {plan.requirements.length} conditions
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {plan.description || 'Plan de prêt standard'}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="text-sm">
                      <div className="flex items-center text-gray-500">
                        <Calculator className="h-3.5 w-3.5 mr-1" />
                        <span>Montant</span>
                      </div>
                      <p className="font-medium">
                        {plan.min_amount.toLocaleString('fr-FR')} - {plan.max_amount.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>Durée</span>
                      </div>
                      <p className="font-medium">
                        {plan.min_duration} - {plan.max_duration} mois
                      </p>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex items-center text-gray-500">
                        <Percent className="h-3.5 w-3.5 mr-1" />
                        <span>Taux</span>
                      </div>
                      <p className="font-medium">
                        {plan.interest_rate}% {plan.fees > 0 && `+ ${plan.fees}% frais`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default LoanPlansSelector;

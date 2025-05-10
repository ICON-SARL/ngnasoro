
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Circle, CircleCheck, Info, AlertTriangle } from 'lucide-react';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { LoanPlan } from '@/types/sfdClients';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SfdLoanPlansTableProps {
  sfdId?: string;
  subsidizedOnly?: boolean;
}

export function SfdLoanPlansTable({ sfdId, subsidizedOnly = false }: SfdLoanPlansTableProps) {
  const navigate = useNavigate();
  const { data: plans = [], isLoading, error } = useSfdLoanPlans();
  const { activeSfdId } = useAuth();
  const { toast } = useToast();

  // Log current state for debugging
  console.log('SfdLoanPlansTable rendering with:', { 
    sfdId, 
    activeSfdId, 
    providedPlans: plans?.length,
    subsidizedOnly
  });

  const handleApplyForLoan = (planId: string) => {
    if (!activeSfdId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté à une SFD pour faire une demande de prêt",
        variant: "destructive"
      });
      return;
    }
    
    navigate('/mobile-flow/loan-application', { 
      state: { planId }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="border rounded-md p-4 mb-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-6 w-[80px]" />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <div className="border rounded-md p-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-6 w-[80px]" />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center py-6 text-center border rounded-md">
        <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
        <p className="text-red-500 font-medium">Erreur lors du chargement des plans de prêt</p>
        <p className="text-sm text-gray-500 mt-2">Veuillez réessayer ultérieurement</p>
      </div>
    );
  }

  // Filter plans based on subsidized status and SFD ID
  const filteredPlans = plans.filter(plan => {
    // Check for valid plan (active and published)
    const isValid = plan.is_active && (plan.is_published !== false);
    
    // Check if it matches the SFD filter (if provided, otherwise use activeSfdId)
    const effectiveSfdId = sfdId || activeSfdId;
    const matchesSfd = effectiveSfdId ? plan.sfd_id === effectiveSfdId : true;
    
    // Check if it matches the subsidy filter
    const isSubsidized = plan.name.toLowerCase().includes('subvention') || 
                        plan.description?.toLowerCase().includes('subvention');
    
    const matchesSubsidyFilter = subsidizedOnly ? isSubsidized : !isSubsidized;
    
    console.log(`Plan ${plan.name} [${plan.id}]:`, { 
      isValid, 
      matchesSfd, 
      matchesSubsidyFilter, 
      sfd_id: plan.sfd_id
    });
    
    return isValid && matchesSfd && matchesSubsidyFilter;
  });
  
  console.log('Filtered plans:', filteredPlans.length);
  
  if (filteredPlans.length === 0) {
    return (
      <div className="border rounded-md p-6 text-center">
        <Info className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">
          Aucun plan de prêt {subsidizedOnly ? "subventionné" : ""} disponible
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Veuillez contacter votre SFD pour plus d'informations
        </p>
      </div>
    );
  }

  // Display cards for loan plans
  return (
    <div className="space-y-4">
      {filteredPlans.map(plan => (
        <Card 
          key={plan.id} 
          className="overflow-hidden hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{plan.name}</h3>
                <p className="text-xs text-gray-600">{plan.description}</p>
                {plan.sfds && (
                  <p className="text-xs text-[#0D6A51] mt-1">
                    {plan.sfds.name}
                  </p>
                )}
              </div>
              <Badge className="bg-green-100 text-green-800 border-0">
                {plan.interest_rate}%
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Montant:</p>
                <p>{plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Durée:</p>
                <p>{plan.min_duration} - {plan.max_duration} mois</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => handleApplyForLoan(plan.id)}
                      className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                    >
                      Faire une demande
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cliquez pour soumettre une demande de prêt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default SfdLoanPlansTable;

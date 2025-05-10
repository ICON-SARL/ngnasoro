
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Circle, CircleCheck, Info } from 'lucide-react';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { LoanPlan } from '@/types/sfdClients';

interface SfdLoanPlansTableProps {
  sfdId?: string;
  subsidizedOnly?: boolean;
}

export function SfdLoanPlansTable({ sfdId, subsidizedOnly = false }: SfdLoanPlansTableProps) {
  const navigate = useNavigate();
  const { data: plans = [], isLoading, error } = useSfdLoanPlans();

  const handleApplyForLoan = (planId: string) => {
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
      <div className="border rounded-md p-4 text-center text-red-500">
        Erreur lors du chargement des plans de prêt
      </div>
    );
  }

  // Filter plans by sfdId if provided and ensure only published plans are shown
  const filteredPlans = plans.filter(plan => {
    // Vérifier si le plan est actif et publié
    const isValid = plan.is_active && plan.is_published;
    
    // Si un sfdId est fourni, filtrer par sfdId
    const matchesSfd = sfdId ? plan.sfd_id === sfdId : true;
    
    // Filter by subsidized status if requested
    const isSubsidized = plan.name.toLowerCase().includes('subvention') || 
                         plan.description?.toLowerCase().includes('subvention');
    
    const matchesSubsidyFilter = subsidizedOnly ? isSubsidized : !isSubsidized;
    
    return isValid && matchesSfd && matchesSubsidyFilter;
  });
  
  if (filteredPlans.length === 0) {
    return (
      <div className="border rounded-md p-4 text-center text-gray-500">
        Aucun plan de prêt {subsidizedOnly ? "subventionné" : ""} publié disponible
      </div>
    );
  }

  // Modern card-based display for loan plans
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

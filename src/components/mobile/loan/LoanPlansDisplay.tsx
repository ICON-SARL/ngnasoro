
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { BadgePercent } from 'lucide-react';
import { LoanPlanCard } from './LoanPlanCard';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';

interface LoanPlansDisplayProps {
  subsidizedOnly?: boolean;
  sfdId?: string;
}

export default function LoanPlansDisplay({ subsidizedOnly = false, sfdId }: LoanPlansDisplayProps) {
  const { data: loanPlans, isLoading } = useSfdLoanPlans();
  
  // Filter plans based on whether they're subsidized
  const filteredPlans = loanPlans?.filter(plan => {
    if (subsidizedOnly) {
      return plan.name.toLowerCase().includes('subvention') || 
             plan.description?.toLowerCase().includes('subvention');
    } else {
      return !plan.name.toLowerCase().includes('subvention') && 
             !plan.description?.toLowerCase().includes('subvention');
    }
  }) || [];

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : filteredPlans.length > 0 ? (
        <div className="space-y-3">
          {filteredPlans.map(plan => (
            <LoanPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <BadgePercent className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-gray-500">
            Aucun plan de prêt {subsidizedOnly ? 'subventionné' : ''} disponible
          </p>
        </div>
      )}
    </div>
  );
}

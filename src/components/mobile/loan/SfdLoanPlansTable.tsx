
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Circle, CircleCheck } from 'lucide-react';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface SfdLoanPlansTableProps {
  sfdId?: string;
}

export function SfdLoanPlansTable({ sfdId }: SfdLoanPlansTableProps) {
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

  // Filter plans by sfdId if provided
  const filteredPlans = sfdId 
    ? plans.filter(plan => plan.sfd_id === sfdId) 
    : plans;
  
  if (filteredPlans.length === 0) {
    return (
      <div className="border rounded-md p-4 text-center text-gray-500">
        Aucun plan de prêt disponible pour cette SFD
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-6 gap-2 bg-gray-50 p-4 text-sm font-medium text-gray-700">
        <div className="col-span-2">Nom</div>
        <div className="col-span-1">Montant</div>
        <div className="col-span-1">Durée</div>
        <div className="col-span-1">Taux</div>
        <div className="col-span-1">Actions</div>
      </div>
      
      {/* Loan Plans */}
      {filteredPlans.map(plan => (
        <div 
          key={plan.id}
          className="grid grid-cols-6 gap-2 p-4 border-t text-sm items-center"
        >
          <div className="col-span-2">
            <p className="font-medium">{plan.name}</p>
            <p className="text-xs text-gray-500 truncate">{plan.description}</p>
          </div>
          <div className="col-span-1">
            {plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA
          </div>
          <div className="col-span-1">
            {plan.min_duration} - {plan.max_duration} mois
          </div>
          <div className="col-span-1">
            {plan.interest_rate}%
          </div>
          <div className="col-span-1 flex space-x-2">
            {plan.is_active ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleApplyForLoan(plan.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <span className="flex items-center">
                  <CircleCheck className="h-4 w-4 text-green-500" />
                </span>
              </>
            ) : (
              <span className="flex items-center">
                <Circle className="h-4 w-4 text-gray-400" />
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SfdLoanPlansTable;

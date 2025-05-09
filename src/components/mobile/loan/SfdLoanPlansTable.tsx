
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Circle, CircleCheck, Info } from 'lucide-react';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  // Filter plans by sfdId if provided and ensure only published plans are shown
  const filteredPlans = plans.filter(plan => {
    // Vérifier si le plan est actif et publié
    if (!plan.is_active || !plan.is_published) {
      return false;
    }
    
    // Si un sfdId est fourni, filtrer par sfdId
    if (sfdId) {
      return plan.sfd_id === sfdId;
    }
    
    // Si pas de sfdId, montrer tous les plans actifs et publiés
    return true;
  });
  
  if (filteredPlans.length === 0) {
    return (
      <div className="border rounded-md p-4 text-center text-gray-500">
        Aucun plan de prêt publié disponible
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden bg-white">
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
          className="grid grid-cols-6 gap-2 p-4 border-t text-sm items-center hover:bg-gray-50"
        >
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <p className="font-medium">{plan.name}</p>
              {plan.is_active && plan.is_published && (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  Actif
                </Badge>
              )}
            </div>
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
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleApplyForLoan(plan.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-48">Cliquez sur l'icône d'édition pour faire une demande avec ce plan</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SfdLoanPlansTable;

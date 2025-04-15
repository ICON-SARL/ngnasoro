
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Percent, CreditCard, ChevronRight, Calculator } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';

interface LoanPlan {
  id: string;
  sfd_id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  requirements: string[];
  is_active: boolean;
  created_at: string;
  is_subsidized?: boolean;
  subsidy_rate?: number;
  sfds?: {
    name: string;
    logo_url: string;
  };
}

interface LoanPlansDisplayProps {
  subsidizedOnly?: boolean;
}

export default function LoanPlansDisplay({ subsidizedOnly = false }: LoanPlansDisplayProps) {
  const { data: loanPlans, isLoading } = useSfdLoanPlans();
  
  const filteredPlans = loanPlans?.filter(plan => 
    subsidizedOnly ? 
      plan.name.toLowerCase().includes('subvention') || 
      plan.description?.toLowerCase().includes('subvention')
    : !plan.name.toLowerCase().includes('subvention') && 
      !plan.description?.toLowerCase().includes('subvention')
  );

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : filteredPlans && filteredPlans.length > 0 ? (
        <div className="space-y-3">
          {filteredPlans.map(plan => (
            <Card key={plan.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {plan.sfds?.name}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={subsidizedOnly ? 
                      "bg-amber-50 border-amber-200 text-amber-700" : 
                      "bg-green-50 border-green-200 text-green-700"}
                  >
                    {plan.interest_rate}%
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                    <div className="text-sm">
                      <p className="text-gray-500">Montant</p>
                      <p className="font-medium">
                        {plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <div className="text-sm">
                      <p className="text-gray-500">Durée</p>
                      <p className="font-medium">{plan.min_duration} - {plan.max_duration} mois</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="w-full mt-4 flex justify-center items-center text-sm font-medium text-[#0D6A51] hover:bg-[#0D6A51]/5 py-2 border-t border-gray-100"
                  onClick={() => window.location.href = '/mobile-flow/loan-application'}
                >
                  Simuler ce prêt <Calculator className="h-4 w-4 ml-1" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">
            Aucun plan de prêt {subsidizedOnly ? 'subventionné' : ''} disponible
          </p>
        </div>
      )}
    </div>
  );
}


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Percent, FileText } from 'lucide-react';
import { LoanPlan } from '@/types/sfdClients';

interface LoanPlanCardProps {
  plan: LoanPlan;
}

export function LoanPlanCard({ plan }: LoanPlanCardProps) {
  const navigate = useNavigate();
  
  const handleApply = () => {
    navigate('/mobile-flow/loan-application', { state: { planId: plan.id } });
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{plan.name}</h3>
            {plan.sfds?.name && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                {plan.sfds.logo_url && (
                  <img 
                    src={plan.sfds.logo_url} 
                    alt={plan.sfds.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                )}
                {plan.sfds.name}
              </p>
            )}
          </div>
        </div>

        {plan.description && (
          <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
        )}

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="flex justify-center text-[#0D6A51] mb-1">
              <CreditCard className="h-4 w-4" />
            </div>
            <p className="text-xs text-gray-500">Montant</p>
            <p className="text-sm font-medium">
              {plan.min_amount.toLocaleString('fr-FR')} - {plan.max_amount.toLocaleString('fr-FR')} FCFA
            </p>
          </div>

          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="flex justify-center text-[#0D6A51] mb-1">
              <Calendar className="h-4 w-4" />
            </div>
            <p className="text-xs text-gray-500">Durée</p>
            <p className="text-sm font-medium">
              {plan.min_duration} - {plan.max_duration} mois
            </p>
          </div>

          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="flex justify-center text-[#0D6A51] mb-1">
              <Percent className="h-4 w-4" />
            </div>
            <p className="text-xs text-gray-500">Taux</p>
            <p className="text-sm font-medium">{plan.interest_rate}%</p>
          </div>
        </div>

        {plan.requirements && plan.requirements.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
              <FileText className="h-4 w-4" />
              <span>Documents requis:</span>
            </div>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              {plan.requirements.map((req, index) => (
                <li key={index} className="text-xs">{req}</li>
              ))}
            </ul>
          </div>
        )}

        <Button 
          className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          onClick={handleApply}
        >
          Demander ce prêt
        </Button>
      </CardContent>
    </Card>
  );
}

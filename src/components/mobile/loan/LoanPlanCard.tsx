
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Clock, ChevronRight, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoanPlanCardProps {
  plan: {
    id: string;
    name: string;
    description?: string;
    min_amount: number;
    max_amount: number;
    duration_months: number;
    interest_rate: number;
    is_active?: boolean;
    sfd_id?: string;
    created_at?: string;
    sfds?: {
      name: string;
      logo_url?: string;
    };
  };
  showApplyButton?: boolean;
  onClick?: () => void;
}

export const LoanPlanCard: React.FC<LoanPlanCardProps> = ({ 
  plan, 
  showApplyButton = true,
  onClick 
}) => {
  const navigate = useNavigate();
  
  const handleApply = () => {
    navigate('/mobile-flow/loan-application', { 
      state: { planId: plan.id } 
    });
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (showApplyButton) {
      handleApply();
    }
  };
  
  return (
    <Card className="overflow-hidden mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{plan.name}</h3>
            <p className="text-sm text-gray-600">{plan.description}</p>
            {plan.sfds && (
              <p className="text-xs text-gray-500 mt-1">
                {plan.sfds.name}
              </p>
            )}
          </div>
          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
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
              <p className="font-medium">{plan.duration_months} mois</p>
            </div>
          </div>
        </div>
        
        {showApplyButton ? (
          <div className="mt-4 flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/mobile-flow/loan-simulator', { 
                state: { planId: plan.id } 
              })}
              className="text-[#0D6A51]"
            >
              <Calculator className="h-4 w-4 mr-1" />
              Simuler
            </Button>
            
            <Button 
              size="sm"
              onClick={handleApply}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              Souscrire
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ) : (
          <button 
            className="w-full mt-4 flex justify-center items-center text-sm font-medium text-[#0D6A51] hover:bg-[#0D6A51]/5 py-2 border-t border-gray-100"
            onClick={handleClick}
          >
            Voir les détails <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default LoanPlanCard;

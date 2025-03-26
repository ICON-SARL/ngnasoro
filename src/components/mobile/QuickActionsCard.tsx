
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ArrowRight, HandCoins, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsCardProps {
  onAction: (action: string, data?: any) => void;
  loanId: string;
  paymentDue: number;
}

const QuickActionsCard = ({ onAction, loanId, paymentDue }: QuickActionsCardProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="border-0 shadow-sm mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Actions rapides</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className="bg-blue-50/50 border-blue-100 hover:bg-blue-50 text-blue-700 h-auto py-3"
            onClick={() => onAction('Repayment', { loanId, amount: paymentDue })}
          >
            <div className="flex flex-col items-center w-full">
              <CreditCard className="h-5 w-5 mb-1" />
              <span className="text-xs font-normal">Rembourser</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-teal-50/50 border-teal-100 hover:bg-teal-50 text-teal-700 h-auto py-3"
            onClick={() => navigate('/mobile-flow/loan-agreement')}
          >
            <div className="flex flex-col items-center w-full">
              <ArrowRight className="h-5 w-5 mb-1" />
              <span className="text-xs font-normal">Prochaine étape</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-amber-50/50 border-amber-100 hover:bg-amber-50 text-amber-700 h-auto py-3"
            onClick={() => onAction('Loan Application')}
          >
            <div className="flex flex-col items-center w-full">
              <HandCoins className="h-5 w-5 mb-1" />
              <span className="text-xs font-normal">Nouveau prêt</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-green-50/50 border-green-100 hover:bg-green-50 text-green-700 h-auto py-3"
            onClick={() => onAction('Funds Management')}
          >
            <div className="flex flex-col items-center w-full">
              <Wallet className="h-5 w-5 mb-1" />
              <span className="text-xs font-normal">Gérer les fonds</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;

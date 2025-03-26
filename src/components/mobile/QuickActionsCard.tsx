
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Wallet, Volume2 } from 'lucide-react';
import VoiceAssistant from '@/components/VoiceAssistant';

interface QuickActionsCardProps {
  onAction: (action: string, data?: any) => void;
  loanId?: string;
  paymentDue?: number;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ 
  onAction, 
  loanId,
  paymentDue = 0
}) => {
  const [voiceGuidance, setVoiceGuidance] = useState(false);
  
  const handleNewLoanClick = () => {
    setVoiceGuidance(true);
    onAction('Loan Application');
  };
  
  const handleRepaymentClick = () => {
    onAction('Repayment', { amount: paymentDue, loanId });
  };

  return (
    <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden mt-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleNewLoanClick}
            className="h-auto flex flex-col items-center p-6 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            <CreditCard className="h-8 w-8 mb-2" />
            <span className="text-lg">Nouveau prêt</span>
            <div className="flex items-center mt-1 text-xs opacity-80">
              <Volume2 className="h-3 w-3 mr-1" />
              Guide vocal
            </div>
          </Button>
          
          <Button 
            onClick={handleRepaymentClick}
            className="h-auto flex flex-col items-center p-6 bg-[#FFAB2E] hover:bg-[#FFAB2E]/90"
            disabled={!loanId || paymentDue <= 0}
          >
            <Wallet className="h-8 w-8 mb-2" />
            <span className="text-lg">Rembourser</span>
            {paymentDue > 0 && (
              <span className="mt-1 text-xs opacity-80">
                {paymentDue.toLocaleString()} FCFA
              </span>
            )}
          </Button>
        </div>
        
        {voiceGuidance && (
          <VoiceAssistant 
            message="Bienvenue dans l'assistant de demande de prêt. Je vais vous guider à travers les étapes nécessaires pour obtenir un financement adapté à vos besoins." 
            autoPlay={true}
            language="bambara"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;

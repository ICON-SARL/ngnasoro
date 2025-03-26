
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Wallet, Volume2, AlertTriangle, Shield } from 'lucide-react';
import VoiceAssistant from '@/components/VoiceAssistant';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [voiceGuidance, setVoiceGuidance] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  
  const handleNewLoanClick = () => {
    setVoiceGuidance(true);
    onAction('Loan Application');
  };
  
  const handleRepaymentClick = () => {
    // Check if the user is near their daily transaction limit
    const mockDailyLimit = 500000; // 500,000 FCFA
    const mockUsedToday = 480000; // 480,000 FCFA used already
    const remainingLimit = mockDailyLimit - mockUsedToday;
    
    if (paymentDue > remainingLimit) {
      setShowLimitWarning(true);
      toast({
        title: "Plafond journalier presque atteint",
        description: `Il vous reste ${remainingLimit.toLocaleString()} FCFA sur votre plafond quotidien de ${mockDailyLimit.toLocaleString()} FCFA`,
        variant: "destructive", // Changed from "warning" to "destructive"
      });
      // Still allow the action, but with a warning
      setTimeout(() => {
        onAction('Repayment', { amount: paymentDue, loanId });
      }, 1500);
    } else {
      onAction('Repayment', { amount: paymentDue, loanId });
    }
  };

  const handleVoiceGuidanceToggle = () => {
    setVoiceGuidance(!voiceGuidance);
    toast({
      title: voiceGuidance ? "Guide vocal désactivé" : "Guide vocal activé",
      description: voiceGuidance ? 
        "Le guide vocal a été désactivé pour cette session" : 
        "Activez vos haut-parleurs pour entendre les instructions",
    });
  };

  return (
    <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden mt-4">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Actions Rapides</h3>
        
        {showLimitWarning && (
          <Alert variant="destructive" className="mb-4"> {/* Changed from "warning" to "destructive" */}
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Attention: Vous approchez de votre plafond journalier de transactions Mobile Money.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleNewLoanClick}
            className="h-auto flex flex-col items-center p-6 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            <CreditCard className="h-8 w-8 mb-2" />
            <span className="text-lg">Nouveau prêt</span>
            <div 
              className="flex items-center mt-1 text-xs opacity-80 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleVoiceGuidanceToggle();
              }}
            >
              <Volume2 className={`h-3 w-3 mr-1 ${voiceGuidance ? 'text-yellow-300' : ''}`} />
              Guide vocal {voiceGuidance ? 'ON' : 'OFF'}
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
              <div className="flex items-center mt-1 text-xs opacity-80">
                <Shield className="h-3 w-3 mr-1" />
                {paymentDue.toLocaleString()} FCFA
              </div>
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

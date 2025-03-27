
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAccount } from '@/hooks/useAccount';
import { Calendar, Clock, CreditCard, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FinancialSnapshotProps {
  loanId?: string;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
}

const FinancialSnapshot: React.FC<FinancialSnapshotProps> = ({
  loanId,
  nextPaymentDate,
  nextPaymentAmount
}) => {
  const { account } = useAccount();
  const { activeSfdId } = useAuth();
  const { activeSfdAccount, isLoading, refetch, synchronizeBalances } = useSfdAccounts();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Determine which loan has the nearest due date
  const nearestLoan = activeSfdAccount?.loans?.sort((a, b) => {
    const dateA = new Date(a.nextDueDate).getTime();
    const dateB = new Date(b.nextDueDate).getTime();
    return dateA - dateB;
  })[0];
  
  const actualNextPaymentDate = nextPaymentDate || nearestLoan?.nextDueDate;
  const actualNextPaymentAmount = nextPaymentAmount || (nearestLoan?.remainingAmount || 0) / 4; // Simulate a quarterly payment
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' ' + (activeSfdAccount?.currency || account?.currency || 'FCFA');
  };
  
  // Calculate time remaining until next payment
  useEffect(() => {
    if (!actualNextPaymentDate) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const paymentDate = new Date(actualNextPaymentDate);
      const diffTime = paymentDate.getTime() - now.getTime();
      
      if (diffTime <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);
      
      setTimeRemaining({ days, hours, minutes, seconds });
    };
    
    calculateTimeRemaining();
    const intervalId = setInterval(calculateTimeRemaining, 1000); // Update every second for smoother countdown
    
    return () => clearInterval(intervalId);
  }, [actualNextPaymentDate]);
  
  // Manual refresh function for balance
  const refreshBalance = useCallback(() => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    // Use the synchronizeBalances mutation to refresh balance
    synchronizeBalances.mutate(undefined, {
      onSettled: () => {
        refetch();
        setLastUpdated(new Date());
        setIsRefreshing(false);
      }
    });
  }, [isRefreshing, synchronizeBalances, refetch]);
  
  // Simulate balance update every 2 hours
  useEffect(() => {
    // Just updating the lastUpdated timestamp, not the actual balance
    const intervalId = setInterval(() => {
      setLastUpdated(new Date());
    }, 2 * 60 * 60 * 1000); // 2 hours
    
    return () => clearInterval(intervalId);
  }, []);

  // Render a message if no SFD account is active
  if (!activeSfdId && !isLoading) {
    return (
      <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center py-4">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-2" />
            <h3 className="text-lg font-medium mb-2">Aucun compte SFD connecté</h3>
            <p className="text-gray-500 mb-4">
              Vous devez connecter un compte auprès d'une institution SFD pour accéder à vos soldes et prêts.
            </p>
            <Button 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => navigate('/sfd-selector')}
            >
              Connecter un compte SFD
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm text-gray-500 flex items-center">
              <CreditCard className="h-4 w-4 mr-1 text-[#0D6A51]" />
              Solde disponible
            </h3>
            <p className="text-2xl font-bold">
              {isLoading || synchronizeBalances.isPending
                ? "Chargement..." 
                : formatCurrency(activeSfdId ? (activeSfdAccount?.balance || 0) : (account?.balance || 0))}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Mis à jour: {lastUpdated.toLocaleTimeString()}
              </p>
              <button 
                onClick={refreshBalance}
                disabled={isRefreshing || synchronizeBalances.isPending}
                className="text-xs text-blue-500 flex items-center"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing || synchronizeBalances.isPending ? 'animate-spin' : ''}`} />
                {isRefreshing || synchronizeBalances.isPending ? 'Actualisation...' : 'Actualiser'}
              </button>
            </div>
          </div>
          
          {(loanId || nearestLoan) && (
            <div className="space-y-2">
              <h3 className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-[#FFAB2E]" />
                Prochain paiement
              </h3>
              <p className="text-2xl font-bold text-[#FFAB2E]">
                {formatCurrency(actualNextPaymentAmount)}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span className={timeRemaining.days < 3 ? "text-red-500 font-medium" : ""}>
                  {timeRemaining.days}j {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSnapshot;

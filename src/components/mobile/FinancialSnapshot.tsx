
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAccount } from '@/hooks/useAccount';
import { Calendar, Clock, CreditCard } from 'lucide-react';

interface FinancialSnapshotProps {
  loanId?: string;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
}

const FinancialSnapshot: React.FC<FinancialSnapshotProps> = ({
  loanId,
  nextPaymentDate = "2023-07-15",
  nextPaymentAmount = 25000
}) => {
  const { account } = useAccount();
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' ' + (account?.currency || 'FCFA');
  };
  
  // Calculate time remaining until next payment
  useEffect(() => {
    if (!nextPaymentDate) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const paymentDate = new Date(nextPaymentDate);
      const diffTime = paymentDate.getTime() - now.getTime();
      
      if (diffTime <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0 });
        return;
      }
      
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining({ days, hours, minutes });
    };
    
    calculateTimeRemaining();
    const intervalId = setInterval(calculateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [nextPaymentDate]);
  
  // Simulate balance update every 2 hours
  useEffect(() => {
    // Just updating the lastUpdated timestamp, not the actual balance
    const intervalId = setInterval(() => {
      setLastUpdated(new Date());
    }, 2 * 60 * 60 * 1000); // 2 hours
    
    return () => clearInterval(intervalId);
  }, []);

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
              {formatCurrency(account?.balance || 0)}
            </p>
            <p className="text-xs text-gray-400">
              Mis à jour: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          
          {loanId && (
            <div className="space-y-2">
              <h3 className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-[#FFAB2E]" />
                Prochain paiement
              </h3>
              <p className="text-2xl font-bold text-[#FFAB2E]">
                {formatCurrency(nextPaymentAmount)}
              </p>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span className={timeRemaining.days < 3 ? "text-red-500 font-medium" : ""}>
                  {timeRemaining.days}j {timeRemaining.hours}h {timeRemaining.minutes}m
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

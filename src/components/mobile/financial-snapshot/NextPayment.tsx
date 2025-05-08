
import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useMobileDashboard } from '@/hooks/useMobileDashboard';

interface NextPaymentProps {
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
}

const NextPayment: React.FC<NextPaymentProps> = ({
  nextPaymentDate,
  nextPaymentAmount
}) => {
  const { activeSfdAccount, sfdAccounts } = useSfdAccounts();
  const { activeSfdId } = useAuth();
  const { dashboardData } = useMobileDashboard();
  
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Get the first account's loans if activeSfdAccount is not available
  const fallbackAccount = sfdAccounts?.length > 0 ? sfdAccounts[0] : null;
  const loans = (activeSfdAccount?.loans || []);
  
  // Use dashboard data if available, otherwise fall back to props or active account
  const nearestLoan = dashboardData?.nearestLoan || (loans.length > 0 ? 
    loans.sort((a, b) => {
      const dateA = new Date(a.nextDueDate || a.next_payment_date || '').getTime();
      const dateB = new Date(b.nextDueDate || b.next_payment_date || '').getTime();
      return dateA - dateB;
    })[0] : null);
  
  const actualNextPaymentDate = nextPaymentDate || nearestLoan?.next_payment_date || nearestLoan?.nextDueDate;
  const actualNextPaymentAmount = nextPaymentAmount || nearestLoan?.monthly_payment || (nearestLoan?.remainingAmount || 0) / 4;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    const currency = dashboardData?.account?.currency || 
                    activeSfdAccount?.currency || fallbackAccount?.currency || 'FCFA';
    return amount.toLocaleString('fr-FR') + ' ' + currency;
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
    const intervalId = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(intervalId);
  }, [actualNextPaymentDate]);

  // If there's no payment date or amount, don't render anything
  if (!actualNextPaymentDate || !actualNextPaymentAmount) {
    return null;
  }

  return (
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
  );
};

export default NextPayment;

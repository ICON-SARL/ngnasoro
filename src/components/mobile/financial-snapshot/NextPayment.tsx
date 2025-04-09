
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SfdLoan } from '@/hooks/sfd/types';

interface NextPaymentProps {
  loan: SfdLoan;
}

const NextPayment: React.FC<NextPaymentProps> = ({ loan }) => {
  if (!loan) return null;
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format the next payment date
  const formatNextPayment = (): string => {
    try {
      if (!loan.next_payment_date) return 'Date inconnue';
      
      const nextPaymentDate = new Date(loan.next_payment_date);
      return formatDistanceToNow(nextPaymentDate, { 
        addSuffix: true,
        locale: fr 
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Date inconnue';
    }
  };
  
  return (
    <div>
      <h3 className="text-sm text-gray-500 mb-1">Prochain Paiement</h3>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold">{formatCurrency(loan.monthly_payment)} FCFA</p>
          <p className="text-xs text-gray-500">{formatNextPayment()}</p>
        </div>
        <button className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 text-sm rounded-lg font-medium">
          Payer
        </button>
      </div>
    </div>
  );
};

export default NextPayment;

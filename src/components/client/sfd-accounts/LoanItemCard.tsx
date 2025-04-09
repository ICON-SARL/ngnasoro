
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SfdLoan } from '@/hooks/sfd/types';

interface LoanItemCardProps {
  loan: SfdLoan;
  currency: string;
  onPaymentClick: () => void;
}

const LoanItemCard = ({ loan, currency, onPaymentClick }: LoanItemCardProps) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">Prêt #{loan.id.substring(0, 8)}</h3>
        {loan.isLate ? (
          <Badge variant="destructive">Échéance proche</Badge>
        ) : (
          <Badge variant="outline">En cours</Badge>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Montant initial</span>
          <span>{loan.amount.toLocaleString()} {currency}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Reste à payer</span>
          <span className="font-medium">{(loan.remainingAmount || loan.amount).toLocaleString()} {currency}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Prochaine échéance</span>
          <span className={loan.isLate ? "text-red-600 font-medium" : ""}>{loan.nextDueDate || loan.next_payment_date}</span>
        </div>
      </div>
      <div className="mt-4">
        <Button 
          className="w-full"
          onClick={onPaymentClick}
        >
          Effectuer un paiement
        </Button>
      </div>
    </div>
  );
};

export default LoanItemCard;

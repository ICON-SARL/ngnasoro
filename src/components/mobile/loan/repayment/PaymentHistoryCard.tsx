
import React from 'react';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PaymentRecord {
  id: number;
  date: string;
  amount: number;
  status: string;
}

interface PaymentHistoryCardProps {
  paymentHistory: PaymentRecord[];
}

const PaymentHistoryCard: React.FC<PaymentHistoryCardProps> = ({ paymentHistory }) => {
  return (
    <Card className="border p-4 bg-gray-50">
      <div className="flex items-center mb-2">
        <Clock className="h-5 w-5 text-gray-500 mr-2" />
        <h3 className="font-medium">Historique des paiements</h3>
      </div>
      <div className="space-y-2 mt-3">
        {paymentHistory.map((payment) => (
          <div 
            key={payment.id} 
            className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
          >
            <div>
              <p className="text-sm font-medium">{payment.date}</p>
              <p className="text-xs text-gray-500">
                Paiement {payment.status === 'paid' ? 'réussi' : 'en attente'}
              </p>
            </div>
            <p className="font-bold text-teal-600">{payment.amount.toFixed(2)} FCFA</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PaymentHistoryCard;

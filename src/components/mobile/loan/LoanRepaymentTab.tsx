
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, CircleDollarSign, ArrowUpRight } from 'lucide-react';

interface PaymentHistoryItem {
  id: number;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'late';
}

interface LoanRepaymentTabProps {
  nextPaymentDue: string;
  paymentHistory: PaymentHistoryItem[];
  onMobileMoneyPayment: () => void;
  loanId?: string;
}

const LoanRepaymentTab = ({
  nextPaymentDue,
  paymentHistory,
  onMobileMoneyPayment,
  loanId
}: LoanRepaymentTabProps) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3">
          <h3 className="font-semibold">Prochain paiement</h3>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Échéance</span>
            <span className="font-medium">{nextPaymentDue}</span>
          </div>
          
          <div className="flex items-center justify-center gap-4 my-6">
            <DialogTrigger asChild>
              <Button
                onClick={onMobileMoneyPayment}
                className="px-6 py-3 h-auto bg-[#0D6A51] hover:bg-[#0a5a45]"
              >
                <CircleDollarSign className="h-5 w-5 mr-2" />
                Payer maintenant
              </Button>
            </DialogTrigger>
          </div>
          
          <div className="flex items-start space-x-2 text-amber-700 bg-amber-50 rounded p-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Paiement anticipé</p>
              <p>
                Vous pouvez effectuer un paiement avant la date d'échéance sans frais supplémentaires.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Historique des paiements</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Masquer" : "Afficher"}
          </Button>
        </div>
        
        {showHistory && (
          <div className="space-y-3">
            {paymentHistory.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center text-gray-500">
                  Aucun paiement effectué pour le moment
                </CardContent>
              </Card>
            ) : (
              paymentHistory.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{payment.date}</p>
                        <p className="text-sm text-gray-500">
                          {payment.status === 'paid' 
                            ? 'Payé' 
                            : payment.status === 'pending' 
                              ? 'En attente' 
                              : 'En retard'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{payment.amount.toLocaleString()} FCFA</p>
                        {payment.status === 'paid' && (
                          <span className="text-xs text-green-600">
                            Payé via Mobile Money
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            
            <Button 
              variant="outline" 
              className="w-full text-[#0D6A51]"
              size="sm"
            >
              Télécharger les reçus
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanRepaymentTab;

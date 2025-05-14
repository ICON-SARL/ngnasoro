
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LoanStatus } from '@/types/loans';

export interface LoanTrackingTabProps {
  loanStatus: LoanStatus;
}

const LoanTrackingTab: React.FC<LoanTrackingTabProps> = ({ loanStatus }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold mb-2">Prochain paiement</h3>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-[#0D6A51]" />
            <p className="font-bold">{loanStatus.nextPaymentDue}</p>
          </div>
          {loanStatus.lateFees > 0 && (
            <div className="flex items-start gap-2 mt-3 rounded bg-red-50 p-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <p className="font-semibold text-red-600">Frais de retard</p>
                <p className="text-red-600">{loanStatus.lateFees.toFixed(2)} FCFA</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold mb-2">Progression</h3>
          <div className="flex justify-between text-sm mb-1">
            <span>Payé: {loanStatus.paidAmount.toFixed(2)} FCFA</span>
            <span>Restant: {loanStatus.remainingAmount.toFixed(2)} FCFA</span>
          </div>
          <Progress value={loanStatus.progress} className="h-2 mb-3" />
          <p className="text-xs text-gray-500 text-center mt-1">
            {loanStatus.progress}% du total de {loanStatus.totalAmount.toFixed(2)} FCFA
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold mb-2">Historique des paiements</h3>
          <div className="space-y-3">
            {loanStatus.paymentHistory.map(payment => (
              <div key={payment.id} className="flex justify-between items-center py-1 border-b border-gray-100">
                <div>
                  <p className="font-medium">{payment.date}</p>
                  <p className="text-xs text-gray-500">Paiement mensuel</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{payment.amount.toFixed(2)} FCFA</p>
                  <p className={`text-xs ${payment.status === 'paid' ? 'text-green-600' : payment.status === 'late' ? 'text-red-600' : 'text-orange-600'}`}>
                    {payment.status === 'paid' ? 'Payé' : payment.status === 'late' ? 'En retard' : 'En attente'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {loanStatus.paymentHistory.length === 0 && (
            <p className="text-center text-gray-500 py-2">Aucun paiement effectué</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanTrackingTab;

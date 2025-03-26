
import React from 'react';
import { Clock, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface PaymentHistory {
  id: number;
  date: string;
  amount: number;
  status: string;
}

interface LoanStatus {
  nextPaymentDue: string;
  paidAmount: number;
  totalAmount: number;
  remainingAmount: number;
  progress: number;
  lateFees: number;
  paymentHistory: PaymentHistory[];
  disbursed: boolean;
  withdrawn: boolean;
}

interface LoanTrackingTabProps {
  loanStatus: LoanStatus;
}

const LoanTrackingTab = ({ loanStatus }: LoanTrackingTabProps) => {
  return (
    <div className="mt-2 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-sm text-gray-500">Payé à ce jour</p>
          <p className="text-xl font-bold">{loanStatus.paidAmount} FCFA</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Restant</p>
          <p className="text-xl font-bold">{loanStatus.remainingAmount} FCFA</p>
        </div>
      </div>
      
      <Progress value={loanStatus.progress} className="h-2 bg-gray-100" />
      
      <div className="flex justify-between items-center text-sm mt-2">
        <span className="font-medium">{loanStatus.progress}% remboursé</span>
        <span className="text-gray-500">Prochain paiement: {loanStatus.nextPaymentDue}</span>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold flex items-center mb-4">
          <Clock className="h-5 w-5 mr-2" /> Historique des paiements
        </h3>
        
        {loanStatus.paymentHistory.map((payment, index) => (
          <div key={payment.id} className="mb-4 relative pl-6">
            <div className={`absolute top-1.5 left-0 w-3 h-3 rounded-full ${index === 0 ? 'bg-teal-500' : index === 1 ? 'bg-purple-400' : 'bg-teal-300'}`}></div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Paiement automatique</p>
                <p className="text-xs text-gray-500">{payment.date}</p>
              </div>
              <p className="font-bold">{payment.amount.toFixed(2)} FCFA</p>
            </div>
          </div>
        ))}
      </div>
      
      {loanStatus.lateFees > 0 && (
        <Alert variant="destructive" className="mt-4">
          <Bell className="h-4 w-4" />
          <AlertTitle>Paiement en retard</AlertTitle>
          <AlertDescription>
            Des frais de retard de {loanStatus.lateFees} FCFA ont été appliqués à votre prêt.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="bg-purple-100 border-0 rounded-xl mt-6">
        <CardContent className="p-4">
          <div className="flex">
            <div className="flex-shrink-0 mr-4">
              <img src="/lovable-uploads/ef525c3f-3c63-46c2-a852-9c93524d29df.png" alt="Processing" className="w-16 h-16" />
            </div>
            <div>
              <h3 className="font-bold">Votre prêt est actif</h3>
              <p className="text-sm mt-1">Prochain paiement le {loanStatus.nextPaymentDue}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanTrackingTab;

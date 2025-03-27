
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Building, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface PaymentHistory {
  id: number;
  date: string;
  amount: number;
  status: string;
}

interface LoanRepaymentTabProps {
  nextPaymentDue: string;
  paymentHistory: PaymentHistory[];
  onMobileMoneyPayment: () => void;
  loanId?: string;
}

const LoanRepaymentTab = ({ 
  nextPaymentDue, 
  paymentHistory, 
  onMobileMoneyPayment,
  loanId = 'LOAN123'
}: LoanRepaymentTabProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleRepayment = (method: 'mobile' | 'agency') => {
    if (method === 'mobile') {
      // Rediriger vers la page de paiement sécurisé avec les paramètres appropriés
      navigate('/mobile-flow/secure-payment', { 
        state: { 
          isRepayment: true, 
          loanId 
        } 
      });
    } else {
      // Agency QR code payment
      onMobileMoneyPayment();
    }
  };
  
  return (
    <div className="mt-2 space-y-4">
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-bold">Prochain paiement</h3>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Date d'échéance</p>
              <p className="font-bold">{nextPaymentDue}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Montant dû</p>
              <p className="font-bold text-lg">3 500 FCFA</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Options de paiement</h3>
        
        <Card className="border hover:border-teal-500 transition-colors cursor-pointer">
          <CardContent className="p-4" onClick={() => handleRepayment('mobile')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                  <Smartphone className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium">Mobile Money</h4>
                  <p className="text-xs text-gray-500">Paiement via MTN Mobile Money</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-teal-500">
                Choisir
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <DialogTrigger asChild>
          <Card className="border hover:border-teal-500 transition-colors cursor-pointer">
            <CardContent className="p-4" onClick={() => handleRepayment('agency')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Paiement en agence SFD</h4>
                    <p className="text-xs text-gray-500">Générez un QR code à présenter en agence</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-teal-500">
                  Choisir
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        
        <Card className="border p-4 bg-gray-50">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="font-medium">Historique des paiements</h3>
          </div>
          <div className="space-y-2 mt-3">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                <div>
                  <p className="text-sm font-medium">{payment.date}</p>
                  <p className="text-xs text-gray-500">Paiement {payment.status === 'paid' ? 'réussi' : 'en attente'}</p>
                </div>
                <p className="font-bold text-teal-600">{payment.amount.toFixed(2)} FCFA</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoanRepaymentTab;

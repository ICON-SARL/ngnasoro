
import React from 'react';
import { LoanStatus, LoanPayment } from '@/types/loans';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CircleAlertIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';

interface LoanTrackingTabProps {
  loanStatus?: LoanStatus | null;
}

const LoanTrackingTab: React.FC<LoanTrackingTabProps> = ({ loanStatus }) => {
  if (!loanStatus) {
    return <div className="p-4 text-center text-gray-500">Aucune information disponible</div>;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const paymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-amber-500" />;
      case 'overdue':
      case 'late':
        return <CircleAlertIcon className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const paymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return "Payé";
      case 'pending':
        return "En attente";
      case 'overdue':
      case 'late':
        return "En retard";
      default:
        return "Inconnu";
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress tracker */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Progression remboursement</h3>
          <span className="text-sm font-bold">{Math.round(loanStatus.progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-500 h-2.5 rounded-full" 
            style={{ width: `${loanStatus.progress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs mt-2 text-gray-500">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
      
      {/* Payment overview */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Résumé des paiements</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Montant total</p>
            <p className="font-semibold">{formatCurrency(loanStatus.totalAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Payé</p>
            <p className="font-semibold text-green-600">{formatCurrency(loanStatus.paidAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Restant</p>
            <p className="font-semibold">{formatCurrency(loanStatus.remainingAmount)}</p>
          </div>
          {loanStatus.lateFees > 0 && (
            <div>
              <p className="text-xs text-gray-500">Pénalités de retard</p>
              <p className="font-semibold text-red-600">{formatCurrency(loanStatus.lateFees)}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Next payment */}
      {loanStatus.nextPaymentDue && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Prochain paiement</h3>
          <p className="text-lg font-bold">{formatDate(loanStatus.nextPaymentDue)}</p>
          <p className="text-xs text-gray-500">Respectez cette échéance pour éviter les pénalités</p>
        </div>
      )}
      
      {/* Payment history */}
      {loanStatus.paymentHistory && loanStatus.paymentHistory.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Historique des paiements</h3>
          
          <div className="space-y-3">
            {loanStatus.paymentHistory.map((payment: LoanPayment) => (
              <div key={payment.id} className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  {paymentStatusIcon(payment.status)}
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
                  {paymentStatusText(payment.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanTrackingTab;

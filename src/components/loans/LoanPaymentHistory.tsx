
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { loanService } from '@/utils/sfdLoanApi';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2, DollarSign, CreditCard, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LoanPaymentHistoryProps {
  loanId: string;
}

export const LoanPaymentHistory: React.FC<LoanPaymentHistoryProps> = ({ loanId }) => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['loan-payments', loanId],
    queryFn: () => loanService.getLoanPayments(loanId),
    enabled: !!loanId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-lg font-medium mb-1">Aucun paiement</h3>
        <p className="text-muted-foreground">
          Aucun paiement n'a encore été enregistré pour ce prêt.
        </p>
      </div>
    );
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'cash':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Complété</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Échoué</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Méthode</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Référence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell className="font-medium">
                {payment.amount.toLocaleString()} FCFA
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(payment.payment_method)}
                  <span className="capitalize">{payment.payment_method}</span>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(payment.status)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {payment.transaction_id || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

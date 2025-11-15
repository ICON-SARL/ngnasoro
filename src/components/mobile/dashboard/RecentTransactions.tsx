import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine, CreditCard, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
  status: string;
  payment_method?: 'mobile_money' | 'cash' | 'bank_transfer' | 'check';
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions, 
  isLoading 
}) => {
  const navigate = useNavigate();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownToLine className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpFromLine className="w-4 h-4 text-orange-600" />;
      case 'loan_disbursement':
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Dépôt';
      case 'withdrawal':
        return 'Retrait';
      case 'transfer':
        return 'Transfert';
      case 'loan_disbursement':
        return 'Décaissement prêt';
      case 'loan_payment':
        return 'Remboursement';
      default:
        return type;
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const absAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('fr-FR').format(absAmount);
    // Si le montant est déjà négatif, c'est un retrait/débit
    const isPositive = amount > 0;
    const prefix = isPositive ? '+' : '-';
    return `${prefix} ${formatted} FCFA`;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-4 space-y-3">
        <Skeleton className="h-5 w-40" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground">Aucune transaction récente</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Transactions récentes</h3>
        <button 
          onClick={() => navigate('/mobile-flow/transactions')}
          className="text-xs text-primary hover:underline"
        >
          Voir tout
        </button>
      </div>

      <div className="space-y-2">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-accent transition-colors cursor-pointer"
            onClick={() => navigate(`/mobile-flow/transactions`)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                {getTransactionIcon(transaction.type)}
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {transaction.description || getTransactionLabel(transaction.type)}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(transaction.created_at), 'dd MMM yyyy', { locale: fr })}
                  </p>
                  {transaction.payment_method && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {transaction.payment_method === 'mobile_money' ? 'Mobile Money' :
                         transaction.payment_method === 'cash' ? 'Espèces' :
                         transaction.payment_method === 'bank_transfer' ? 'Virement' :
                         transaction.payment_method}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold text-sm ${
                transaction.type === 'deposit' || transaction.type === 'loan_disbursement'
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}>
                {formatAmount(transaction.amount, transaction.type)}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {transaction.status}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine, CreditCard, MoreHorizontal, Receipt } from 'lucide-react';
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
        return <ArrowDownToLine className="w-4 h-4 text-primary" />;
      case 'withdrawal':
        return <ArrowUpFromLine className="w-4 h-4 text-accent" />;
      case 'loan_disbursement':
        return <CreditCard className="w-4 h-4 text-purple-600" />;
      default:
        return <MoreHorizontal className="w-4 h-4 text-muted-foreground" />;
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
    const isPositive = amount > 0;
    const prefix = isPositive ? '+' : '-';
    return `${prefix} ${formatted}`;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-4 space-y-3">
        <Skeleton className="h-5 w-40" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6">
        <div className="text-center py-6">
          <div className="mx-auto w-12 h-12 bg-muted/40 rounded-full flex items-center justify-center mb-3">
            <Receipt className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <p className="font-medium text-sm text-foreground">Aucune transaction</p>
          <p className="text-xs text-muted-foreground mt-1">
            Vos prochaines transactions apparaîtront ici
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-foreground">Transactions récentes</h3>
        <button 
          onClick={() => navigate('/mobile-flow/transactions')}
          className="text-xs text-primary font-medium"
        >
          Voir tout
        </button>
      </div>

      <div className="space-y-1">
        {transactions.slice(0, 5).map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
            onClick={() => navigate(`/mobile-flow/transactions`)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/50 rounded-xl">
                {getTransactionIcon(transaction.type)}
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {transaction.description || getTransactionLabel(transaction.type)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(transaction.created_at), 'dd MMM', { locale: fr })}
                  {transaction.payment_method && (
                    <span className="ml-1">
                      • {transaction.payment_method === 'mobile_money' ? 'Mobile' :
                         transaction.payment_method === 'cash' ? 'Espèces' :
                         transaction.payment_method}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold text-sm ${
                transaction.type === 'deposit' || transaction.type === 'loan_disbursement'
                  ? 'text-primary'
                  : 'text-accent'
              }`}>
                {formatAmount(transaction.amount, transaction.type)} <span className="text-xs font-normal">FCFA</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;

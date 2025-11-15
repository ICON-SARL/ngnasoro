import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine, CreditCard, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FundsActionSheet } from '@/components/mobile/funds/FundsActionSheet';
import { Dialog } from '@/components/ui/dialog';
import MobileMoneyModal from '@/components/mobile/loan/MobileMoneyModal';

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
  const [isDepositSheetOpen, setIsDepositSheetOpen] = useState(false);
  const [showMobileMoneyModal, setShowMobileMoneyModal] = useState(false);

  const handleDepositClick = () => {
    setIsDepositSheetOpen(true);
  };

  const handleMobileMoneySelected = () => {
    setIsDepositSheetOpen(false);
    setShowMobileMoneyModal(true);
  };

  const handleCashierScanSelected = () => {
    setIsDepositSheetOpen(false);
    navigate('/mobile-flow/cashier-qr-scan');
  };

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
      <div className="bg-card rounded-2xl p-6 text-center space-y-3">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm text-foreground">Aucune transaction</p>
          <p className="text-xs text-muted-foreground mt-1">
            Vos prochaines transactions apparaîtront ici
          </p>
        </div>
        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={handleDepositClick}
            className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Faire un dépôt
          </button>
          <button
            onClick={() => navigate('/mobile-flow/loan-plans')}
            className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Demander un prêt
          </button>
        </div>

        {/* Sheet pour choisir le mode de dépôt */}
        <FundsActionSheet 
          isOpen={isDepositSheetOpen}
          onClose={() => setIsDepositSheetOpen(false)}
          actionType="deposit"
          onMobileMoneySelected={handleMobileMoneySelected}
          onCashierScanSelected={handleCashierScanSelected}
        />

        {/* Modal Mobile Money */}
        <Dialog open={showMobileMoneyModal} onOpenChange={setShowMobileMoneyModal}>
          <MobileMoneyModal 
            onClose={() => setShowMobileMoneyModal(false)}
            isWithdrawal={false}
          />
        </Dialog>
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

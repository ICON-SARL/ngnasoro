import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { SfdAccount } from '@/types/sfdAccounts';
import { FundsActionSheet } from '@/components/mobile/funds/FundsActionSheet';
import { CashierQRScanner } from '@/components/mobile/funds/CashierQRScanner';
import MobileMoneyModal from '@/components/mobile/loan/MobileMoneyModal';
import { Dialog } from '@/components/ui/dialog';

interface AccountBalanceCardProps {
  balance: number;
  currency: string;
  accounts: SfdAccount[];
}

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({ 
  balance, 
  currency,
  accounts 
}) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [fundsActionType, setFundsActionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [showFundsSheet, setShowFundsSheet] = useState(false);
  const [showMobileMoneyModal, setShowMobileMoneyModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-to-br from-accent to-accent/85 rounded-3xl p-5 text-white shadow-lg -mt-6 relative overflow-hidden"
    >
      {/* Cercle décoratif subtil */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/8 rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-white/5 rounded-full" />
      
      <div className="relative">
        {/* Header avec label et toggle */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/80 font-medium">Solde disponible</span>
          <button
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            {isBalanceVisible ? (
              <Eye className="h-4 w-4 text-white/80" />
            ) : (
              <EyeOff className="h-4 w-4 text-white/80" />
            )}
          </button>
        </div>

        {/* Montant principal */}
        <motion.div
          key={isBalanceVisible ? 'visible' : 'hidden'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-5"
        >
          <h2 className="text-3xl font-bold tracking-tight">
            {isBalanceVisible ? formatBalance(balance) : '••••••'}
            <span className="text-base font-medium ml-2 opacity-80">{currency}</span>
          </h2>
        </motion.div>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setFundsActionType('deposit');
              setShowFundsSheet(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 rounded-2xl font-medium text-sm transition-all duration-300"
          >
            <ArrowDownToLine className="w-4 h-4" />
            Recharger
          </button>
          <button
            onClick={() => {
              setFundsActionType('withdrawal');
              setShowFundsSheet(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-2xl font-medium text-sm transition-all duration-300"
          >
            <ArrowUpFromLine className="w-4 h-4" />
            Retirer
          </button>
        </div>

        {/* Comptes supplémentaires */}
        {accounts.length > 1 && (
          <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-white/10">
            {accounts.map((account) => (
              <div 
                key={account.id}
                className="bg-white/10 px-3 py-1.5 rounded-full text-xs"
              >
                <span className="opacity-80">{account.name}:</span>
                <span className="font-semibold ml-1">
                  {isBalanceVisible ? formatBalance(account.balance) : '•••'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Funds Action Sheet */}
      <FundsActionSheet
        isOpen={showFundsSheet}
        onClose={() => setShowFundsSheet(false)}
        actionType={fundsActionType}
        onMobileMoneySelected={() => {
          setShowFundsSheet(false);
          setShowMobileMoneyModal(true);
        }}
        onCashierScanSelected={() => {
          setShowFundsSheet(false);
          setShowQRScanner(true);
        }}
      />

      {/* Mobile Money Modal */}
      <Dialog open={showMobileMoneyModal} onOpenChange={setShowMobileMoneyModal}>
        <MobileMoneyModal
          onClose={() => setShowMobileMoneyModal(false)}
          isWithdrawal={fundsActionType === 'withdrawal'}
        />
      </Dialog>

      {/* QR Scanner */}
      <CashierQRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        transactionType={fundsActionType}
      />
    </motion.div>
  );
};

export default AccountBalanceCard;

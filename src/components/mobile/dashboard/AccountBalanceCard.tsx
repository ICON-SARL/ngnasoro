import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowDownToLine, ArrowUpFromLine, Wallet } from 'lucide-react';
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
      className="relative bg-gradient-to-br from-[#F5A623] via-[#F8B84C] to-[#FCC572] rounded-[28px] p-6 text-white shadow-xl -mt-6 overflow-hidden"
    >
      {/* Background Decorations Premium */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-white/8 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-0 w-32 h-32 bg-gradient-radial from-white/10 to-transparent rounded-full blur-xl" />
        {/* Shimmer effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
          animate={{ x: ['-200%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
        />
      </div>
      
      <div className="relative z-10">
        {/* Header avec icon wallet */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Wallet className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm text-white/90 font-medium tracking-wide">Solde disponible</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200"
          >
            {isBalanceVisible ? (
              <Eye className="h-4 w-4 text-white" />
            ) : (
              <EyeOff className="h-4 w-4 text-white" />
            )}
          </motion.button>
        </div>

        {/* Montant principal */}
        <motion.div
          key={isBalanceVisible ? 'visible' : 'hidden'}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-4xl font-bold tracking-tight flex items-baseline gap-2">
            {isBalanceVisible ? formatBalance(balance) : '••••••'}
            <span className="text-lg font-semibold opacity-90">{currency}</span>
          </h2>
        </motion.div>

        {/* Boutons Glass Modernisés */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setFundsActionType('deposit');
              setShowFundsSheet(true);
            }}
            className="flex-1 flex items-center justify-center gap-2.5 bg-white/30 hover:bg-white/40 backdrop-blur-md border border-white/40 py-3.5 rounded-2xl font-semibold text-sm shadow-lg transition-all duration-200"
          >
            <ArrowDownToLine className="w-5 h-5" />
            Recharger
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setFundsActionType('withdrawal');
              setShowFundsSheet(true);
            }}
            className="flex-1 flex items-center justify-center gap-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/25 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200"
          >
            <ArrowUpFromLine className="w-5 h-5" />
            Retirer
          </motion.button>
        </div>

        {/* Comptes supplémentaires */}
        {accounts.length > 1 && (
          <div className="flex gap-2 flex-wrap mt-5 pt-4 border-t border-white/15">
            {accounts.map((account) => (
              <div 
                key={account.id}
                className="bg-white/15 backdrop-blur-sm px-3.5 py-2 rounded-xl text-xs border border-white/10"
              >
                <span className="opacity-80">{account.name}:</span>
                <span className="font-bold ml-1.5">
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

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-to-br from-accent via-accent/90 to-accent/80 rounded-3xl p-5 text-white shadow-soft-lg -mt-4 relative overflow-hidden"
    >
      {/* Decorative circles - softer */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs opacity-90 font-medium">Solde principal</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
          >
            {isBalanceVisible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>

        <motion.div
          key={isBalanceVisible ? 'visible' : 'hidden'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-4"
        >
          <h2 className="text-4xl font-bold mb-0.5">
            {isBalanceVisible ? formatBalance(balance) : '••••••'}
          </h2>
          <p className="text-xs opacity-80">{currency}</p>
        </motion.div>

        {/* Action buttons - softer style */}
        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => {
              setFundsActionType('deposit');
              setShowFundsSheet(true);
            }}
            className="flex-1 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border-0 h-10 rounded-xl font-medium text-sm transition-all duration-300"
          >
            <ArrowDownToLine className="w-4 h-4 mr-1.5" />
            Recharger
          </Button>
          <Button
            onClick={() => {
              setFundsActionType('withdrawal');
              setShowFundsSheet(true);
            }}
            variant="outline"
            className="flex-1 bg-transparent hover:bg-white/10 text-white border-white/25 h-10 rounded-xl font-medium text-sm transition-all duration-300"
          >
            <ArrowUpFromLine className="w-4 h-4 mr-1.5" />
            Retirer
          </Button>
        </div>

        {accounts.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            {accounts.map((account, index) => (
              <div 
                key={account.id}
                className="bg-primary-foreground/10 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px]"
              >
                <span className="opacity-90">{account.name}:</span>
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

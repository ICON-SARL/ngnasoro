import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SfdAccount } from '@/types/sfdAccounts';
import { useNavigate } from 'react-router-dom';

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
  const [isBalanceVisible, setIsBalanceVisible] = React.useState(true);
  const navigate = useNavigate();

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDeposit = () => {
    setActionType('deposit');
    setFundsSheetOpen(true);
  };

  const handleWithdrawal = () => {
    setActionType('withdrawal');
    setFundsSheetOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-2xl -mt-4 relative overflow-hidden"
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm opacity-90 font-medium">Solde principal</span>
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
          className="mb-6"
        >
          <h2 className="text-5xl font-bold mb-1">
            {isBalanceVisible ? formatBalance(balance) : '••••••'}
          </h2>
          <p className="text-sm opacity-90">{currency}</p>
        </motion.div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-4">
          <Button
            onClick={() => navigate('/mobile-flow/funds-management?action=deposit')}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 h-12 rounded-2xl font-medium"
          >
            <ArrowDownToLine className="w-5 h-5 mr-2" />
            Recharger
          </Button>
          <Button
            onClick={() => navigate('/mobile-flow/funds-management?action=withdraw')}
            variant="outline"
            className="flex-1 bg-transparent hover:bg-white/10 text-white border-white/30 h-12 rounded-2xl font-medium"
          >
            <ArrowUpFromLine className="w-5 h-5 mr-2" />
            Retirer
          </Button>
        </div>

        {accounts.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {accounts.map((account, index) => (
              <div 
                key={account.id}
                className="bg-primary-foreground/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs"
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
    </motion.div>
  );
};

export default AccountBalanceCard;

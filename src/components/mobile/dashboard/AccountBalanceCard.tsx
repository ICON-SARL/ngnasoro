import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SfdAccount } from '@/types/sfdAccounts';

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

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-3xl p-6 text-primary-foreground shadow-xl -mt-4 relative overflow-hidden"
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-90 font-medium">Solde Total</span>
          </div>
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
          <h2 className="text-4xl font-bold mb-1">
            {isBalanceVisible ? formatBalance(balance) : '••••••'}
          </h2>
          <p className="text-sm opacity-90">{currency}</p>
        </motion.div>

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

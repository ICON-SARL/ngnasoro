
import React from 'react';
import { ArrowDown, ArrowUp, Send, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TransferOptionsProps {
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

const options = [
  {
    id: 'deposit',
    icon: ArrowDown,
    label: 'Dépôt',
    description: 'Recharger',
    variant: 'primary' as const,
  },
  {
    id: 'withdraw',
    icon: ArrowUp,
    label: 'Retrait',
    description: 'Retirer',
    variant: 'default' as const,
  },
  {
    id: 'transfer',
    icon: Send,
    label: 'Transfert',
    description: 'Envoyer',
    variant: 'default' as const,
  },
  {
    id: 'loan',
    icon: CreditCard,
    label: 'Prêt',
    description: 'Demander',
    variant: 'default' as const,
  },
];

const TransferOptions: React.FC<TransferOptionsProps> = ({ 
  onDeposit,
  onWithdraw
}) => {
  const navigate = useNavigate();

  const handleAction = (id: string) => {
    switch (id) {
      case 'deposit':
        onDeposit?.();
        break;
      case 'withdraw':
        onWithdraw?.();
        break;
      case 'transfer':
        navigate('/mobile-flow/transfers');
        break;
      case 'loan':
        navigate('/mobile-flow/loan-application');
        break;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option, index) => {
        const Icon = option.icon;
        const isPrimary = option.variant === 'primary';
        
        return (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleAction(option.id)}
            className={cn(
              "flex flex-col items-center justify-center p-5 rounded-xl border transition-all",
              "shadow-soft-sm hover:shadow-soft-md",
              isPrimary 
                ? "bg-primary/5 border-primary/20 hover:border-primary/40" 
                : "bg-card border-border hover:border-muted-foreground/30"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
              isPrimary ? "bg-primary/10" : "bg-muted"
            )}>
              <Icon className={cn(
                "h-5 w-5",
                isPrimary ? "text-primary" : "text-foreground"
              )} />
            </div>
            <span className="font-medium text-foreground">{option.label}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{option.description}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default TransferOptions;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Vault, PiggyBank, History } from 'lucide-react';
import { motion } from 'framer-motion';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: CreditCard,
      label: 'Prêt',
      bgColor: 'bg-[#0D6A51]/10',
      iconColor: 'text-[#0D6A51]',
      action: () => navigate('/mobile-flow/loan-plans')
    },
    {
      icon: PiggyBank,
      label: 'Épargne',
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-600',
      action: () => navigate('/mobile-flow/savings')
    },
    {
      icon: Vault,
      label: 'Coffre',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
      action: () => navigate('/mobile-flow/vaults-hub')
    },
    {
      icon: History,
      label: 'Historique',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      action: () => navigate('/mobile-flow/transactions')
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => (
        <motion.button
          key={action.label}
          whileTap={{ scale: 0.96 }}
          onClick={action.action}
          className="flex flex-col items-center gap-2 py-4 rounded-xl bg-card shadow-sm border border-border/50 hover:shadow-md transition-all"
        >
          <div className={`p-2.5 rounded-xl ${action.bgColor}`}>
            <action.icon className={`w-4 h-4 ${action.iconColor}`} />
          </div>
          <span className="text-xs font-medium text-foreground">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;

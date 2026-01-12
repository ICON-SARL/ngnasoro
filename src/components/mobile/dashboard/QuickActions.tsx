import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Vault } from 'lucide-react';
import { motion } from 'framer-motion';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: CreditCard,
      label: 'Prêt',
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      action: () => navigate('/mobile-flow/loan-plans')
    },
    {
      icon: Vault,
      label: 'Coffre',
      bgColor: 'bg-accent/10',
      iconColor: 'text-accent',
      action: () => navigate('/mobile-flow/vaults-hub')
    }
  ];

  return (
    <div className="flex gap-3">
      {actions.map((action) => (
        <motion.button
          key={action.label}
          whileTap={{ scale: 0.96 }}
          onClick={action.action}
          className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className={`p-3 rounded-xl ${action.bgColor}`}>
            <action.icon className={`w-5 h-5 ${action.iconColor}`} />
          </div>
          <span className="text-sm font-medium text-foreground">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;

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
      description: 'Demander un financement',
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      action: () => navigate('/mobile-flow/loan-plans')
    },
    {
      icon: Vault,
      label: 'Coffre',
      description: 'Gérer votre épargne',
      bgColor: 'bg-accent/10',
      iconColor: 'text-accent',
      action: () => navigate('/mobile-flow/vaults-hub')
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 gap-3"
    >
      {actions.map((action) => (
        <motion.button
          key={action.label}
          whileTap={{ scale: 0.97 }}
          onClick={action.action}
          className="flex flex-col items-center gap-2 py-5 px-4 rounded-2xl bg-card border border-border/50 hover:bg-muted/50 transition-all duration-200"
        >
          <div className={`p-4 rounded-2xl ${action.bgColor}`}>
            <action.icon className={`w-6 h-6 ${action.iconColor}`} />
          </div>
          <div className="text-center">
            <span className="text-sm font-semibold text-foreground block">
              {action.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {action.description}
            </span>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default QuickActions;

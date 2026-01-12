import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Vault, Send, History } from 'lucide-react';
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
    },
    {
      icon: Send,
      label: 'Transfert',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      action: () => navigate('/mobile-flow/transfer')
    },
    {
      icon: History,
      label: 'Historique',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      action: () => navigate('/mobile-flow/transactions')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-4 gap-2"
    >
      {actions.map((action) => (
        <motion.button
          key={action.label}
          variants={itemVariants}
          whileTap={{ scale: 0.95 }}
          onClick={action.action}
          className="flex flex-col items-center gap-2 py-3 px-2 rounded-2xl bg-card hover:bg-muted/50 transition-colors duration-200"
        >
          <div className={`p-3 rounded-xl ${action.bgColor}`}>
            <action.icon className={`w-5 h-5 ${action.iconColor}`} />
          </div>
          <span className="text-xs font-medium text-foreground">{action.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default QuickActions;

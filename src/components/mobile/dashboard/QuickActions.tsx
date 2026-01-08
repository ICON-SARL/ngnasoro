import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Vault, CreditCard, PiggyBank } from 'lucide-react';
import { motion } from 'framer-motion';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Wallet,
      label: 'Prêt',
      description: 'Demander',
      gradient: 'from-primary to-primary/80',
      action: () => navigate('/mobile-flow/loan-plans')
    },
    {
      icon: Vault,
      label: 'Coffre',
      description: 'Épargner',
      gradient: 'from-accent to-accent/80',
      action: () => navigate('/mobile-flow/vaults-hub')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-4 px-2"
    >
      {actions.map((action) => (
        <motion.button
          key={action.label}
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.action}
          className="group relative overflow-hidden rounded-2xl p-4 text-left transition-all"
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-10 group-hover:opacity-15 transition-opacity`} />
          
          {/* Border */}
          <div className="absolute inset-0 rounded-2xl border border-border/50 group-hover:border-primary/20 transition-colors" />
          
          {/* Content */}
          <div className="relative flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} text-primary-foreground shadow-lg`}>
              <action.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default QuickActions;

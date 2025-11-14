import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, ShoppingBag, Users, Gift, Lock, HelpCircle, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Wallet,
      label: 'Prêt',
      color: 'bg-gradient-to-br from-violet-400 to-purple-500',
      action: () => navigate('/mobile-flow/loan-application')
    },
    {
      icon: Users,
      label: 'Tontine',
      color: 'bg-gradient-to-br from-sky-400 to-blue-500',
      action: () => navigate('/mobile-flow/tontine')
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-6 px-4 max-w-md mx-auto">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          onClick={action.action}
          className="flex flex-col items-center gap-4 active:scale-95 transition-transform"
        >
          <div className={`${action.color} w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-sm`}>
            <action.icon className="w-9 h-9" />
          </div>
          <span className="text-sm font-semibold text-foreground">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;

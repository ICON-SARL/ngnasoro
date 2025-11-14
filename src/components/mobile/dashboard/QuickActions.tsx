import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, ShoppingBag, Users, Gift, Lock, HelpCircle, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: CreditCard,
      label: 'Paiements',
      color: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      action: () => navigate('/mobile-flow/funds-management?action=deposit')
    },
    {
      icon: Wallet,
      label: 'Prêt',
      color: 'bg-gradient-to-br from-violet-400 to-purple-500',
      action: () => navigate('/mobile-flow/loan-application')
    },
    {
      icon: ShoppingBag,
      label: 'Market',
      color: 'bg-gradient-to-br from-orange-400 to-pink-500',
      action: () => {}
    },
    {
      icon: CreditCard,
      label: 'Carte',
      color: 'bg-gradient-to-br from-purple-300 to-violet-400',
      action: () => {}
    },
    {
      icon: Users,
      label: 'Tontine',
      color: 'bg-gradient-to-br from-sky-400 to-blue-500',
      action: () => navigate('/mobile-flow/tontine')
    },
    {
      icon: Gift,
      label: 'Cadeaux',
      color: 'bg-gradient-to-br from-pink-400 to-rose-500',
      action: () => {}
    },
    {
      icon: Lock,
      label: 'Coffre',
      color: 'bg-gradient-to-br from-amber-300 to-yellow-400',
      action: () => {}
    },
    {
      icon: HelpCircle,
      label: 'Support',
      color: 'bg-gradient-to-br from-gray-400 to-slate-500',
      action: () => navigate('/mobile-flow/support')
    },
    {
      icon: MoreHorizontal,
      label: 'Plus',
      color: 'bg-gradient-to-br from-gray-300 to-gray-400',
      action: () => {}
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4 px-1">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          onClick={action.action}
          className="flex flex-col items-center gap-3 active:scale-95 transition-transform"
        >
          <div className={`${action.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
            <action.icon className="w-7 h-7" />
          </div>
          <span className="text-xs font-medium text-foreground">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;

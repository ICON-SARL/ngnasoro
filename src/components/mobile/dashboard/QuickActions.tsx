import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Vault } from 'lucide-react';
import { motion } from 'framer-motion';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Wallet,
      label: 'Prêt',
      color: 'bg-gradient-to-br from-[#176455] to-[#1a7a65]',
      action: () => navigate('/mobile-flow/loan-application')
    },
    {
      icon: Vault,
      label: 'Coffre',
      color: 'bg-gradient-to-br from-purple-500 via-indigo-600 to-pink-600',
      action: () => navigate('/mobile-flow/vaults-hub')
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

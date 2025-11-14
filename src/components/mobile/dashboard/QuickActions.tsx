import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine, Send, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: ArrowDownToLine,
      label: 'Dépôt',
      color: 'bg-green-500',
      action: () => navigate('/mobile-flow/funds-management?action=deposit')
    },
    {
      icon: ArrowUpFromLine,
      label: 'Retrait',
      color: 'bg-orange-500',
      action: () => navigate('/mobile-flow/funds-management?action=withdraw')
    },
    {
      icon: Send,
      label: 'Transfert',
      color: 'bg-blue-500',
      action: () => navigate('/mobile-flow/funds-management?action=transfer')
    },
    {
      icon: CreditCard,
      label: 'Prêt',
      color: 'bg-purple-500',
      action: () => navigate('/mobile-flow/loan-application')
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          onClick={action.action}
          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card hover:bg-accent transition-colors active:scale-95"
        >
          <div className={`${action.color} p-3 rounded-xl text-white shadow-md`}>
            <action.icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-foreground">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;

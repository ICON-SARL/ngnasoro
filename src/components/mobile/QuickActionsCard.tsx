
import React from 'react';
import { ArrowUpRight, ArrowDownLeft, CalendarClock, CreditCard, Wallet } from 'lucide-react';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  bgColor?: string;
  iconColor?: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick, bgColor = "bg-blue-50", iconColor = "text-blue-500" }) => {
  return (
    <button
      className={`flex flex-col items-center justify-center rounded-xl p-2 ${bgColor} hover:bg-blue-100 transition-colors`}
      onClick={onClick}
    >
      <div className={`rounded-full p-1.5 ${iconColor} bg-white/30`}>{icon}</div>
      <span className="text-sm mt-1">{label}</span>
    </button>
  );
};

const QuickActionsCard: React.FC<{ onAction: (action: string, data?: any) => void; loanId?: string; paymentDue?: number }> = ({ onAction, loanId, paymentDue }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-medium mb-3">Actions Rapides</h3>
      <div className="grid grid-cols-3 gap-3">
        <QuickAction
          icon={<ArrowUpRight className="h-5 w-5" />}
          label="Envoyer"
          onClick={() => onAction('Send')}
        />
        <QuickAction
          icon={<ArrowDownLeft className="h-5 w-5" />}
          label="Recevoir"
          onClick={() => onAction('Receive')}
        />
        <QuickAction
          icon={<CalendarClock className="h-5 w-5" />}
          label="Programmer"
          onClick={() => onAction('Schedule transfer')}
        />
        {loanId ? (
          <QuickAction
            icon={<CreditCard className="h-5 w-5" />}
            label="Rembourser"
            onClick={() => onAction('Repayment', { loanId, amount: paymentDue })}
            bgColor="bg-amber-50"
            iconColor="text-amber-500"
          />
        ) : (
          <QuickAction
            icon={<Wallet className="h-5 w-5" />}
            label="Crédits"
            onClick={() => onAction('Loans')}
            bgColor="bg-amber-50"
            iconColor="text-amber-500"
          />
        )}
      </div>
    </div>
  );
};

export default QuickActionsCard;


import React from 'react';
import { Card } from '@/components/ui/card';
import TransferOptions from '@/components/funds/TransferOptions';

interface QuickActionsSectionProps {
  onDeposit: () => void;
  onWithdraw: () => void;
}

const QuickActionsSection = ({ onDeposit, onWithdraw }: QuickActionsSectionProps) => {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Actions rapides</h2>
      <TransferOptions 
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
      />
    </div>
  );
};

export default QuickActionsSection;

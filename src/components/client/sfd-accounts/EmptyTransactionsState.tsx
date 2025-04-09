
import React from 'react';
import { History, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyTransactionsStateProps {
  onViewHistory?: () => void;
}

const EmptyTransactionsState = ({ onViewHistory }: EmptyTransactionsStateProps) => {
  return (
    <div className="text-center p-6 border rounded-lg">
      <History className="h-8 w-8 mx-auto mb-2 text-gray-400" />
      <p className="text-gray-500 mb-4">Aucune transaction récente pour ce compte</p>
      <div className="flex justify-center space-x-2">
        <Button 
          variant="outline" 
          onClick={onViewHistory}
          className="flex items-center gap-2"
        >
          <ArrowRightLeft className="h-4 w-4" />
          Effectuer une transaction
        </Button>
      </div>
    </div>
  );
};

export default EmptyTransactionsState;

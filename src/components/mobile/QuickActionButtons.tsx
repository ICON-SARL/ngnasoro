
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDownCircle, ArrowUpCircle, ArrowRightCircle } from 'lucide-react';

interface QuickActionButtonsProps {
  onActionClick: (action: string) => void;
}

const QuickActionButtons = ({ onActionClick }: QuickActionButtonsProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 mb-2">
      <Button 
        onClick={() => onActionClick('Déposer')} 
        className="flex flex-col items-center h-auto py-3 bg-green-100 hover:bg-green-200 text-[#0D6A51] rounded-xl"
      >
        <ArrowDownCircle className="h-6 w-6 mb-1" />
        <span className="text-xs">Déposer</span>
      </Button>
      
      <Button 
        onClick={() => onActionClick('Retirer')} 
        className="flex flex-col items-center h-auto py-3 bg-green-100 hover:bg-green-200 text-[#0D6A51] rounded-xl"
      >
        <ArrowUpCircle className="h-6 w-6 mb-1" />
        <span className="text-xs">Retirer</span>
      </Button>
      
      <Button 
        onClick={() => onActionClick('Transférer')} 
        className="flex flex-col items-center h-auto py-3 bg-green-100 hover:bg-green-200 text-[#0D6A51] rounded-xl"
      >
        <ArrowRightCircle className="h-6 w-6 mb-1" />
        <span className="text-xs">Transférer</span>
      </Button>
    </div>
  );
};

export default QuickActionButtons;

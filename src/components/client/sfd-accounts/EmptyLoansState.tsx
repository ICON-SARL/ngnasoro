
import React from 'react';
import { CreditCard, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyLoansStateProps {
  onRequestLoan?: () => void;
}

const EmptyLoansState = ({ onRequestLoan }: EmptyLoansStateProps) => {
  return (
    <div className="text-center p-6 border rounded-lg">
      <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
      <p className="text-gray-500 mb-4">Aucun prêt actif pour ce compte</p>
      <Button 
        variant="outline" 
        onClick={onRequestLoan}
        className="flex items-center gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Demander un prêt
      </Button>
    </div>
  );
};

export default EmptyLoansState;

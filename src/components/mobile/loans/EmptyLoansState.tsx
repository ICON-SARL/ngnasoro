
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyLoansStateProps {
  canApplyForLoan: boolean;
}

const EmptyLoansState: React.FC<EmptyLoansStateProps> = ({ canApplyForLoan }) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8 bg-white rounded-xl shadow-sm p-8">
      <div className="bg-[#0D6A51]/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <Wallet className="h-8 w-8 text-[#0D6A51]" />
      </div>
      <h3 className="text-lg font-medium mb-2 text-gray-800">Aucun prêt</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
        Vous n'avez pas encore de prêt dans cette catégorie
      </p>
      {canApplyForLoan && (
        <Button 
          onClick={() => navigate('/loans/apply')}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 px-6 py-2 rounded-full flex items-center gap-2 mx-auto"
        >
          <Plus className="h-4 w-4" />
          Faire une demande
        </Button>
      )}
    </div>
  );
};

export default EmptyLoansState;

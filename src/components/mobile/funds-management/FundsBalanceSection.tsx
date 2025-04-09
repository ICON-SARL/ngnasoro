
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface FundsBalanceSectionProps {
  balance: number;
  currency?: string;
  isLoading?: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
}

const FundsBalanceSection: React.FC<FundsBalanceSectionProps> = ({
  balance,
  currency = 'FCFA',
  isLoading = false,
  onDeposit,
  onWithdraw
}) => {
  return (
    <Card className="p-4">
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-medium text-gray-500 mb-1">Solde actuel</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-12">
            <Loader size="md" />
          </div>
        ) : (
          <p className="text-3xl font-bold text-[#0D6A51]">
            {balance.toLocaleString('fr-FR')} {currency}
          </p>
        )}
        
        <p className="text-xs text-gray-500 mb-4">
          Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
        </p>
        
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          <Button 
            variant="outline" 
            className="flex items-center justify-center"
            onClick={onDeposit}
          >
            <ArrowDown className="h-4 w-4 mr-2 text-green-600" />
            Dépôt
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-center"
            onClick={onWithdraw}
          >
            <ArrowUp className="h-4 w-4 mr-2 text-red-600" />
            Retrait
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FundsBalanceSection;

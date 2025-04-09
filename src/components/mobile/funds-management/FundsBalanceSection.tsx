
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { ArrowDown, ArrowUp, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface FundsBalanceSectionProps {
  balance: number;
  currency?: string;
  isLoading?: boolean;
  isUpdating?: boolean;
  lastUpdated?: string;
  onRefresh?: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
}

const FundsBalanceSection: React.FC<FundsBalanceSectionProps> = ({
  balance,
  currency = 'FCFA',
  isLoading = false,
  isUpdating = false,
  lastUpdated,
  onRefresh,
  onDeposit,
  onWithdraw
}) => {
  const [isHidden, setIsHidden] = useState(true);

  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center">
        <div className="flex justify-between items-center w-full mb-2">
          <h3 className="text-sm font-medium text-gray-500">Solde actuel</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 text-gray-500 hover:text-gray-700"
              onClick={toggleVisibility}
            >
              {isHidden ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 text-gray-500 hover:text-gray-700"
                onClick={onRefresh}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader size="sm" className="text-[#0D6A51]" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-12">
            <Loader size="md" />
          </div>
        ) : (
          <p className="text-3xl font-bold text-[#0D6A51]">
            {isHidden ? '•••••• ' : balance.toLocaleString('fr-FR')} {currency}
          </p>
        )}
        
        {lastUpdated && (
          <p className="text-xs text-gray-500 mb-4">
            Dernière mise à jour: {lastUpdated}
          </p>
        )}
        
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


import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

interface BalanceDisplayProps {
  isHidden: boolean;
  balance: number;
  currency: string;
  isUpdating: boolean;
  isPending: boolean;
  refreshBalance: () => void;
  toggleBalanceVisibility?: () => void;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  isHidden,
  balance,
  currency,
  isUpdating,
  isPending,
  refreshBalance,
  toggleBalanceVisibility
}) => {
  return (
    <div className="bg-gradient-to-br from-[#0D6A51]/5 to-[#13A180]/5 rounded-2xl p-5 flex flex-col items-center justify-center mt-3 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center mb-2 w-full justify-between">
        <p className="text-[#0D6A51] font-medium">Solde disponible</p>
        <div className="flex items-center">
          {toggleBalanceVisibility && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-[#0D6A51]/70 hover:text-[#0D6A51] hover:bg-[#0D6A51]/10 rounded-full"
              onClick={toggleBalanceVisibility}
            >
              {isHidden ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-[#0D6A51]/70 hover:text-[#0D6A51] hover:bg-[#0D6A51]/10 rounded-full"
            onClick={refreshBalance}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader size="sm" variant="primary" className="text-[#0D6A51]" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="text-center py-3">
        {isHidden ? (
          <p className="text-3xl font-bold text-gray-900">•••••• {currency}</p>
        ) : (
          <p className="text-3xl font-bold text-gray-900 animate-fade-in">
            {balance.toLocaleString('fr-FR')} {currency}
          </p>
        )}
      </div>
      
      {isPending && (
        <div className="bg-[#0D6A51]/10 text-[#0D6A51] px-3 py-1 rounded-full text-xs mt-2 flex items-center">
          <Loader size="xs" variant="primary" className="text-[#0D6A51] mr-1" />
          <p>Synchronisation en cours...</p>
        </div>
      )}
    </div>
  );
};

export default BalanceDisplay;

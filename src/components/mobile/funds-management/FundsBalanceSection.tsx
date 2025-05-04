
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeBalance } from '@/hooks/useRealtimeBalance';
import { formatCurrency } from '@/utils/formatters';

interface FundsBalanceSectionProps {
  balance: number;
  isRefreshing: boolean;
  sfdAccounts: any[];
  onSelectSfd: (sfdId: string) => void;
  selectedSfd: string;
}

const FundsBalanceSection: React.FC<FundsBalanceSectionProps> = ({
  balance: initialBalance,
  isRefreshing,
  sfdAccounts,
  onSelectSfd,
  selectedSfd
}) => {
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  
  useEffect(() => {
    if (selectedSfd !== 'all') {
      const account = sfdAccounts.find(a => a.id === selectedSfd);
      if (account) {
        setSelectedAccount(account);
        console.log('Selected account updated:', account);
      }
    } else {
      setSelectedAccount(null);
    }
  }, [selectedSfd, sfdAccounts]);
  
  // Use real-time balance hook with enhanced account ID handling
  const { balance: realtimeBalance, isLive } = useRealtimeBalance(
    initialBalance,
    selectedAccount?.id || (selectedSfd !== 'all' ? selectedSfd : undefined)
  );

  // Display the real-time balance if available, otherwise use the prop
  const displayBalance = isLive ? realtimeBalance : initialBalance;
  
  // Format the balance with thousand separators
  const formattedBalance = formatCurrency(displayBalance);
  
  return (
    <div className="bg-[#0D6A51] text-white p-5 rounded-b-2xl shadow-md relative">
      <div className="mb-4">
        <h2 className="text-lg font-medium opacity-90">Solde disponible</h2>
        <p className="text-3xl font-bold mt-1">{formattedBalance} FCFA</p>
        {selectedAccount && (
          <p className="text-sm opacity-80 mt-1">
            {selectedAccount.name || 'SFD'}
          </p>
        )}
      </div>
      
      <div className="mt-4">
        <div className="flex overflow-x-auto space-x-2 pb-2">
          <Button
            key="all"
            onClick={() => onSelectSfd('all')}
            variant={selectedSfd === 'all' ? 'default' : 'outline'}
            className={selectedSfd === 'all' 
              ? 'bg-white text-[#0D6A51] hover:bg-white/90' 
              : 'bg-transparent text-white border-white/30 hover:bg-white/10'}
            size="sm"
          >
            Tous les SFDs
          </Button>
          
          {sfdAccounts.map((account) => (
            <Button
              key={account.id}
              onClick={() => onSelectSfd(account.id)}
              variant={selectedSfd === account.id ? 'default' : 'outline'}
              className={selectedSfd === account.id 
                ? 'bg-white text-[#0D6A51] hover:bg-white/90' 
                : 'bg-transparent text-white border-white/30 hover:bg-white/10'}
              size="sm"
            >
              {account.name || 'SFD'}
            </Button>
          ))}
        </div>
      </div>
      
      {isRefreshing && (
        <div className="absolute right-2 top-2">
          <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
        </div>
      )}
      
      {isLive && (
        <div className="text-xs text-white/70 absolute right-2 bottom-2 flex items-center">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span> 
          Temps réel
        </div>
      )}
    </div>
  );
};

export default FundsBalanceSection;

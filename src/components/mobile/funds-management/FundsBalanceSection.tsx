
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Lock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/formatters';
import { useRealtimeBalance } from '@/hooks/useRealtimeBalance';
import { SfdAccountDisplay } from '@/hooks/useSfdAccounts';

interface FundsBalanceSectionProps {
  balance: number;
  isRefreshing: boolean;
  sfdAccounts: SfdAccountDisplay[];
  onSelectSfd: (sfdId: string) => void;
  selectedSfd: string;
}

const FundsBalanceSection: React.FC<FundsBalanceSectionProps> = ({
  balance,
  isRefreshing,
  sfdAccounts,
  onSelectSfd,
  selectedSfd
}) => {
  const [isHidden, setIsHidden] = useState(false);
  const { activeSfdId, setActiveSfdId } = useAuth();
  const { refreshBalance } = useRealtimeBalance(balance, selectedSfd !== 'all' ? selectedSfd : undefined);
  
  const handleSfdChange = (value: string) => {
    onSelectSfd(value);
    if (value !== 'all') {
      setActiveSfdId(value);
    }
  };
  
  const handleRefresh = async () => {
    if (isRefreshing) return;
    await refreshBalance();
  };
  
  return (
    <Card className="border-0 shadow-md bg-gradient-to-r from-[#0D6A51] to-[#0D6A51]/90 text-white p-5 mx-4 mt-4 rounded-xl">
      <div className="flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Solde Disponible</h3>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="text-3xl font-bold mb-4">
          {isHidden ? '••••••' : formatCurrency(balance)} FCFA
        </div>
        
        {sfdAccounts && sfdAccounts.length > 1 && (
          <div className="w-full mt-2">
            <Select 
              value={selectedSfd} 
              onValueChange={handleSfdChange}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Sélectionner une SFD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les SFDs</SelectItem>
                {sfdAccounts.map((sfd) => (
                  <SelectItem key={sfd.id} value={sfd.id}>
                    {sfd.name} ({formatCurrency(sfd.balance || 0)} FCFA)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FundsBalanceSection;

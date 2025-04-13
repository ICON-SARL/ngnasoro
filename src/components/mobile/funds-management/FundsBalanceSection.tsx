
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue } from '@/components/ui/select';
import { SfdAccount } from '@/hooks/useSfdAccounts';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { Wallet, RotateCw } from 'lucide-react';

interface FundsBalanceSectionProps {
  balance: number;
  isRefreshing: boolean;
  sfdAccounts: SfdAccount[];
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
  return (
    <Card className="border-0 shadow-md bg-gradient-to-r from-[#0D6A51] to-[#0D6A51]/90 text-white mx-4 mt-4 rounded-xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Solde disponible</h3>
          {isRefreshing && (
            <RotateCw className="h-5 w-5 animate-spin" />
          )}
        </div>
        
        {sfdAccounts.length > 0 && (
          <Select 
            value={selectedSfd} 
            onValueChange={onSelectSfd}
          >
            <SelectTrigger className="bg-white/20 border-none text-white mb-4">
              <SelectValue placeholder="Sélectionner un compte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les comptes</SelectItem>
              {sfdAccounts.map(sfd => (
                <SelectItem key={sfd.id} value={sfd.id}>
                  {sfd.name || 'Compte SFD'} ({formatCurrencyAmount(sfd.balance)} FCFA)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <div className="text-center py-4">
          <p className="text-3xl font-bold mb-1">{formatCurrencyAmount(balance)} FCFA</p>
          <p className="text-sm opacity-80">{selectedSfd === 'all' ? 'Total de tous les comptes' : 'Solde du compte sélectionné'}</p>
        </div>
        
        {sfdAccounts.length === 0 && (
          <div className="bg-white/10 rounded-lg p-4 mt-2 text-center">
            <Wallet className="h-8 w-8 mx-auto mb-2 opacity-80" />
            <p className="text-sm">Aucun compte SFD connecté</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FundsBalanceSection;

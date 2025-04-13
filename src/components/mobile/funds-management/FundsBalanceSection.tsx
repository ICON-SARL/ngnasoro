import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { Loader } from '@/components/ui/loader';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SfdAccount } from '@/hooks/useSfdAccounts';

interface FundsBalanceSectionProps {
  balance: number;
  isRefreshing?: boolean;
  sfdAccounts?: SfdAccount[];
  onSelectSfd?: (sfdId: string) => void;
  selectedSfd?: string;
}

const FundsBalanceSection: React.FC<FundsBalanceSectionProps> = ({ 
  balance, 
  isRefreshing = false,
  sfdAccounts = [],
  onSelectSfd,
  selectedSfd
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSfdChange = (value: string) => {
    if (onSelectSfd) {
      onSelectSfd(value);
    }
  };

  const selectedSfdName = selectedSfd === 'all' 
    ? 'Tous les comptes' 
    : sfdAccounts.find(acc => acc.id === selectedSfd)?.name || 'Sélectionner un SFD';

  return (
    <div className="bg-gradient-to-r from-[#0D6A51] to-[#0D6A51]/90 text-white p-6 rounded-b-3xl shadow-md">
      <div className="flex flex-col items-center">
        <p className="text-sm font-medium opacity-80 mb-1">Solde disponible</p>
        
        {/* SFD Selector */}
        {sfdAccounts.length > 0 && (
          <div className="w-full max-w-xs mb-3">
            <Select onValueChange={handleSfdChange} value={selectedSfd} defaultValue="all">
              <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                <SelectValue placeholder="Sélectionner un compte SFD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les comptes</SelectItem>
                {sfdAccounts.map((sfd) => (
                  <SelectItem key={sfd.id} value={sfd.id}>
                    {sfd.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Balance Display */}
        {isRefreshing ? (
          <LoadingOverlay />
        ) : (
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight mt-2">
              {formatCurrencyAmount(balance, "")}
            </h1>
            <p className="text-lg mt-1">FCFA</p>
          </div>
        )}
        
        {selectedSfd === 'all' ? (
          <p className="text-sm mt-3 opacity-70 text-center">
            Solde consolidé de vos comptes SFD
          </p>
        ) : (
          <p className="text-sm mt-3 opacity-70 text-center">
            Solde de votre compte {selectedSfdName}
          </p>
        )}
      </div>
    </div>
  );
};

const LoadingOverlay = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-2xl">
    <Loader size="md" />
  </div>
);

export default FundsBalanceSection;

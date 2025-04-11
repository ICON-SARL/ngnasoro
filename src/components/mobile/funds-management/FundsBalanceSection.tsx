
import React, { useState } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
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
  onRefresh?: () => void;
}

const FundsBalanceSection: React.FC<FundsBalanceSectionProps> = ({ 
  balance, 
  isRefreshing = false,
  sfdAccounts = [],
  onSelectSfd,
  selectedSfd,
  onRefresh
}) => {
  const handleSfdChange = (value: string) => {
    if (onSelectSfd) {
      onSelectSfd(value);
    }
  };

  const selectedSfdName = selectedSfd === 'all' 
    ? 'Tous les comptes' 
    : sfdAccounts.find(acc => acc.id === selectedSfd)?.name || 'Sélectionner un SFD';

  return (
    <div className="relative overflow-hidden">
      {/* Curved background with gradient */}
      <div className="bg-gradient-to-r from-[#086450] to-[#129678] text-white p-6 pb-10 rounded-b-[40px] shadow-lg">
        <div className="flex flex-col items-center relative z-10">
          {/* Header with refresh button */}
          <div className="flex w-full justify-between items-center mb-2">
            <p className="text-sm font-medium text-white/90">Solde disponible</p>
            {onRefresh && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader size="sm" className="text-white" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          
          {/* SFD Selector */}
          {sfdAccounts.length > 0 && (
            <div className="w-full max-w-xs mb-4">
              <Select onValueChange={handleSfdChange} value={selectedSfd} defaultValue="all">
                <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 rounded-xl text-base">
                  <SelectValue placeholder="Sélectionner un compte SFD" />
                </SelectTrigger>
                <SelectContent className="bg-white border-0 shadow-lg rounded-xl">
                  <SelectItem value="all" className="text-base font-medium">Tous les comptes</SelectItem>
                  {sfdAccounts.map((sfd) => (
                    <SelectItem key={sfd.id} value={sfd.id} className="text-base font-medium">
                      {sfd.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Balance Display with animation */}
          <div className="relative text-center mt-2 transition-all duration-300 ease-in-out animate-fade-in">
            {isRefreshing ? (
              <div className="flex items-center justify-center h-20 w-full">
                <Loader size="lg" className="text-white" />
              </div>
            ) : (
              <>
                <h1 className="text-6xl font-bold tracking-tight relative mb-1 transition-all duration-500">
                  {formatCurrencyAmount(balance, "")}
                </h1>
                <p className="text-lg font-medium text-white/90 mb-3">FCFA</p>
              </>
            )}
          </div>
          
          {/* Description with icon */}
          <div className="mt-2 flex items-center bg-white/10 px-4 py-2 rounded-full">
            {selectedSfd === 'all' ? (
              <p className="text-sm text-white/90 text-center">
                Solde consolidé de vos comptes SFD
              </p>
            ) : (
              <p className="text-sm text-white/90 text-center">
                Solde de votre compte {selectedSfdName}
              </p>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-4 w-12 h-12 rounded-full bg-white/5"></div>
        <div className="absolute bottom-12 right-8 w-20 h-20 rounded-full bg-white/5"></div>
        <div className="absolute top-20 right-10 w-8 h-8 rounded-full bg-white/5"></div>
      </div>
      
      {/* Card overlap effect */}
      <div className="bg-white h-6 rounded-t-3xl -mt-6 relative z-20"></div>
    </div>
  );
};

export default FundsBalanceSection;

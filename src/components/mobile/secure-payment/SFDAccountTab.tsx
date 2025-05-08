
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Fingerprint, RotateCw, Shield, Lock } from 'lucide-react';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { SfdAccount } from '@/hooks/sfd/types';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import { normalizeSfdAccounts } from '@/utils/accountAdapters';

interface SFDAccountTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
  isWithdrawal?: boolean;
  paymentAmount?: number;
  selectedSfdAccount?: SfdAccount | null;
  syncedAccountsList?: SfdAccount[];
}

export const SFDAccountTab: React.FC<SFDAccountTabProps> = ({ 
  paymentStatus, 
  handlePayment,
  isWithdrawal = false,
  paymentAmount = 3500,
  selectedSfdAccount,
  syncedAccountsList = []
}) => {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  const [selected, setSelected] = useState("");
  const { sfdAccounts, isLoading } = useSfdAccounts();
  const { activeSfdId } = useAuth();
  
  // Use normalized accounts to ensure consistent property names
  const normalizedAccounts = normalizeSfdAccounts(syncedAccountsList.length > 0 ? syncedAccountsList : sfdAccounts);
  const displayAccounts = normalizedAccounts;
  
  // Get the normalized active account
  const effectiveSelectedAccount = selectedSfdAccount || displayAccounts.find(acc => acc.id === activeSfdId);
  
  useEffect(() => {
    if (selectedSfdAccount) {
      setSelected(selectedSfdAccount.id);
    } else if (activeSfdId) {
      setSelected(activeSfdId);
    } else if (displayAccounts.length > 0) {
      setSelected(displayAccounts[0].id);
    }
  }, [selectedSfdAccount, activeSfdId, displayAccounts]);
  
  if (isLoading && displayAccounts.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <RotateCw className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Chargement des données...</span>
      </div>
    );
  }
  
  const accountName = effectiveSelectedAccount ? 
    (effectiveSelectedAccount.name || effectiveSelectedAccount.description || "Compte SFD") : 
    "Compte SFD";
    
  const accountBalance = effectiveSelectedAccount?.balance || 0;
  const formattedBalance = `${formatCurrencyAmount(accountBalance)} FCFA`;
  
  return (
    <>
      <div>
        <Label>{isWithdrawal ? "Compte SFD source" : "Compte SFD source"}</Label>
        {selectedSfdAccount ? (
          <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
            <p className="text-sm font-medium">{accountName}</p>
            <p className="text-xs text-gray-500">{formattedBalance}</p>
          </div>
        ) : (
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un compte" />
            </SelectTrigger>
            <SelectContent>
              {displayAccounts.map(sfd => (
                <SelectItem key={sfd.id} value={sfd.id}>
                  {sfd.name || sfd.description || "Compte SFD"} ({formatCurrencyAmount(sfd.balance)} FCFA)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Lock className="h-3 w-3 mr-1" />
          Compte tokenisé conforme PCI DSS Level 1
        </div>
      </div>
      
      {!isWithdrawal && effectiveSelectedAccount?.loans?.length > 0 && (
        <div>
          <Label>Prêt à rembourser</Label>
          <Select defaultValue={effectiveSelectedAccount?.loans[0].id}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un prêt" />
            </SelectTrigger>
            <SelectContent>
              {effectiveSelectedAccount?.loans.map(loan => (
                <SelectItem key={loan.id} value={loan.id}>
                  {accountName} ({Math.floor(loan.remainingAmount / 4).toLocaleString()} FCFA)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div>
        <Label>{isWithdrawal ? "Montant du retrait" : "Montant du remboursement"}</Label>
        <Input 
          type="text" 
          value={`${isWithdrawal ? '25 000' : paymentAmount.toLocaleString()} FCFA`} 
          readOnly 
        />
        <div className="mt-1 text-xs text-muted-foreground flex items-center">
          <Shield className="h-3 w-3 mr-1" />
          Transaction chiffrée en AES-256
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="biometric" 
          checked={isBiometricEnabled}
          onCheckedChange={setIsBiometricEnabled}
        />
        <Label htmlFor="biometric" className="flex items-center">
          <Fingerprint className="h-4 w-4 mr-1 text-[#0D6A51]" />
          Vérification biométrique
        </Label>
      </div>
      
      {paymentStatus === 'pending' ? (
        <Button disabled className="w-full">
          <RotateCw className="mr-2 h-4 w-4 animate-spin" />
          Traitement en cours...
        </Button>
      ) : (
        <Button 
          className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          onClick={handlePayment}
        >
          {isWithdrawal ? "Retirer maintenant" : "Rembourser maintenant"}
        </Button>
      )}
    </>
  );
};

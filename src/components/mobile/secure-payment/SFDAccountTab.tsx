
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Fingerprint, RotateCw, Shield, Lock } from 'lucide-react';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useAuth } from '@/hooks/useAuth';

interface SFDAccountTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
  isWithdrawal?: boolean;
  paymentAmount?: number;
}

export const SFDAccountTab: React.FC<SFDAccountTabProps> = ({ 
  paymentStatus, 
  handlePayment,
  isWithdrawal = false,
  paymentAmount = 3500
}) => {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  const [selected, setSelected] = useState("");
  const { sfdAccounts, activeSfdAccount, isLoading } = useSfdAccounts();
  const { activeSfdId } = useAuth();
  
  // Initialize with activeSfdId when component mounts
  useEffect(() => {
    if (activeSfdId) {
      setSelected(activeSfdId);
    } else if (sfdAccounts.length > 0) {
      setSelected(sfdAccounts[0].id);
    }
  }, [activeSfdId, sfdAccounts]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <RotateCw className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Chargement des données...</span>
      </div>
    );
  }
  
  return (
    <>
      <div>
        <Label>{isWithdrawal ? "Compte SFD source" : "Compte SFD source"}</Label>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un compte" />
          </SelectTrigger>
          <SelectContent>
            {sfdAccounts.map(sfd => (
              <SelectItem key={sfd.id} value={sfd.id}>
                {sfd.name} ({sfd.balance.toLocaleString()} {sfd.currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Lock className="h-3 w-3 mr-1" />
          Compte tokenisé conforme PCI DSS Level 1
        </div>
      </div>
      
      {!isWithdrawal && activeSfdAccount?.loans?.length > 0 && (
        <div>
          <Label>Prêt à rembourser</Label>
          <Select defaultValue={activeSfdAccount?.loans[0].id}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un prêt" />
            </SelectTrigger>
            <SelectContent>
              {activeSfdAccount?.loans.map(loan => (
                <SelectItem key={loan.id} value={loan.id}>
                  {activeSfdAccount.name} ({Math.floor(loan.remainingAmount / 4).toLocaleString()} FCFA)
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

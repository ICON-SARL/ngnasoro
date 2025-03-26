
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Fingerprint, RotateCw } from 'lucide-react';

interface SFDAccountTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
}

export const SFDAccountTab: React.FC<SFDAccountTabProps> = ({ paymentStatus, handlePayment }) => {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  
  return (
    <>
      <div>
        <Label>Compte SFD</Label>
        <Select defaultValue="primary">
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">SFD Bamako Principal (•••• 1234)</SelectItem>
            <SelectItem value="secondary">SFD Sikasso (•••• 5678)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Compte tokenisé conforme PCI DSS Level 1
        </p>
      </div>
      
      <div>
        <Label>Montant</Label>
        <Input type="text" value="25,000 FCFA" readOnly />
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
          Payer maintenant
        </Button>
      )}
    </>
  );
};

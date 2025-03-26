
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RotateCw } from 'lucide-react';

interface MobileMoneyTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
}

export const MobileMoneyTab: React.FC<MobileMoneyTabProps> = ({ paymentStatus, handlePayment }) => {
  return (
    <>
      <div>
        <Label>Service Mobile Money</Label>
        <Select defaultValue="orange">
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="orange">Orange Money</SelectItem>
            <SelectItem value="wave">Wave</SelectItem>
            <SelectItem value="mtn">MTN Mobile Money</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Numéro de téléphone</Label>
        <Input type="tel" placeholder="+223 XX XX XX XX" />
      </div>
      
      <div>
        <Label>Montant</Label>
        <Input type="text" value="25,000 FCFA" readOnly />
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

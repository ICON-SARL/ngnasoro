
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RotateCw, Smartphone } from 'lucide-react';

interface MobileMoneyTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
  isWithdrawal?: boolean;
}

export const MobileMoneyTab: React.FC<MobileMoneyTabProps> = ({ 
  paymentStatus, 
  handlePayment,
  isWithdrawal = false
}) => {
  const [selected, setSelected] = useState("orange");
  
  return (
    <>
      <div className="space-y-4">
        <RadioGroup defaultValue={selected} onValueChange={setSelected} className="space-y-3">
          <div className="flex items-center p-3 rounded-xl border bg-white shadow-sm hover:bg-orange-50/20 transition-colors">
            <RadioGroupItem value="orange" id="orange" className="text-orange-500" />
            <Label htmlFor="orange" className="font-normal flex items-center ml-2 cursor-pointer">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center mr-3">
                <span className="text-orange-500 font-bold text-sm">OM</span>
              </div>
              <div>
                <p className="font-medium">Orange Money</p>
                <p className="text-xs text-gray-500">Transfert instantané</p>
              </div>
            </Label>
          </div>
          <div className="flex items-center p-3 rounded-xl border bg-white shadow-sm hover:bg-blue-50/20 transition-colors">
            <RadioGroupItem value="wave" id="wave" className="text-blue-500" />
            <Label htmlFor="wave" className="font-normal flex items-center ml-2 cursor-pointer">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-500 font-bold text-sm">WV</span>
              </div>
              <div>
                <p className="font-medium">Wave</p>
                <p className="text-xs text-gray-500">Sans frais</p>
              </div>
            </Label>
          </div>
          <div className="flex items-center p-3 rounded-xl border bg-white shadow-sm hover:bg-yellow-50/20 transition-colors">
            <RadioGroupItem value="mtn" id="mtn" className="text-yellow-500" />
            <Label htmlFor="mtn" className="font-normal flex items-center ml-2 cursor-pointer">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3">
                <span className="text-yellow-500 font-bold text-sm">MTN</span>
              </div>
              <div>
                <p className="font-medium">MTN Mobile Money</p>
                <p className="text-xs text-gray-500">Disponible partout</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
        
        <div>
          <Label htmlFor="phone">Numéro de téléphone</Label>
          <Input id="phone" placeholder="+223 XX XX XX XX" />
          <div className="mt-1 text-xs text-muted-foreground">
            {isWithdrawal ? 
              "Le montant sera envoyé à ce numéro" : 
              "Un code de confirmation sera envoyé à ce numéro"
            }
          </div>
        </div>
        
        <div>
          <Label>Montant</Label>
          <Input type="text" value={isWithdrawal ? "25 000 FCFA" : "3 500 FCFA"} readOnly />
          <div className="flex items-center mt-1 text-xs text-green-600">
            <Smartphone className="h-3 w-3 mr-1" />
            {isWithdrawal ? 
              "Frais de retrait: 250 FCFA" : 
              "Aucuns frais de traitement"
            }
          </div>
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
      </div>
    </>
  );
};

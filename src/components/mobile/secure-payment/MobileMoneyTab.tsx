import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RotateCw, Smartphone } from 'lucide-react';
import { useMobileMoneyOperations } from '@/hooks/useMobileMoneyOperations';
import { useAuth } from '@/hooks/useAuth';

interface MobileMoneyTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
  isWithdrawal?: boolean;
  amount?: number;
  onAmountChange?: (amount: number) => void;
  loanId?: string;
}

export const MobileMoneyTab: React.FC<MobileMoneyTabProps> = ({ 
  paymentStatus, 
  handlePayment,
  isWithdrawal = false,
  amount = isWithdrawal ? 25000 : 3500,
  onAmountChange,
  loanId
}) => {
  const [selected, setSelected] = useState("orange");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { user } = useAuth();
  const { isProcessing, processMobileMoneyPayment, processMobileMoneyWithdrawal } = useMobileMoneyOperations();
  const [customAmount, setCustomAmount] = useState(amount.toString());
  
  // Update amount when custom amount changes
  const handleAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value.replace(/[^\d]/g, ''));
    if (!isNaN(numValue) && onAmountChange) {
      onAmountChange(numValue);
    }
  };
  
  const handleMobileMoneyTransaction = async () => {
    if (!phoneNumber) {
      return;
    }
    
    try {
      const provider = selected as "orange" | "mtn" | "wave";
      const transactionAmount = onAmountChange ? parseFloat(customAmount) : amount;
      
      if (isWithdrawal) {
        await processMobileMoneyWithdrawal(phoneNumber, transactionAmount, provider);
      } else {
        // Pass the loanId for loan repayments
        await processMobileMoneyPayment(phoneNumber, transactionAmount, provider, loanId);
      }
      
      // Call the parent component's handler
      handlePayment();
    } catch (error) {
      console.error('Mobile money transaction error:', error);
    }
  };
  
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
          <Input 
            id="phone" 
            placeholder="+223 XX XX XX XX" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <div className="mt-1 text-xs text-muted-foreground">
            {isWithdrawal ? 
              "Le montant sera envoyé à ce numéro" : 
              "Un code de confirmation sera envoyé à ce numéro"
            }
          </div>
        </div>
        
        <div>
          <Label>Montant</Label>
          {onAmountChange ? (
            <Input 
              type="text" 
              value={customAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Entrez le montant" 
            />
          ) : (
            <Input type="text" value={`${amount.toLocaleString()} FCFA`} readOnly />
          )}
          
          <div className="flex items-center mt-1 text-xs text-green-600">
            <Smartphone className="h-3 w-3 mr-1" />
            {isWithdrawal ? 
              "Frais de retrait: 250 FCFA" : 
              "Aucuns frais de traitement"
            }
          </div>
        </div>
        
        {paymentStatus === 'pending' || isProcessing ? (
          <Button disabled className="w-full">
            <RotateCw className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </Button>
        ) : (
          <Button 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            onClick={handleMobileMoneyTransaction}
            disabled={!phoneNumber}
          >
            {isWithdrawal ? "Retirer maintenant" : "Rembourser maintenant"}
          </Button>
        )}
      </div>
    </>
  );
};

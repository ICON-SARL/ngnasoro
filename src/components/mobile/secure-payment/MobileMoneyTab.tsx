
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMobileMoneyOperations } from '@/hooks/mobile-money';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileMoneyTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
  isWithdrawal?: boolean;
}

const providers = [
  { id: 'orange', name: 'Orange', color: 'from-orange-400 to-orange-500' },
  { id: 'mtn', name: 'MTN', color: 'from-yellow-400 to-yellow-500' },
  { id: 'moov', name: 'Moov', color: 'from-blue-400 to-blue-500' },
];

export const MobileMoneyTab: React.FC<MobileMoneyTabProps> = ({ 
  paymentStatus, 
  handlePayment,
  isWithdrawal = false
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('orange');
  const { isProcessingPayment, isProcessingWithdrawal } = useMobileMoneyOperations();
  
  const isProcessing = isProcessingPayment || isProcessingWithdrawal || paymentStatus === 'pending';
  
  const handleClick = () => {
    if (phoneNumber.trim().length < 8) {
      return;
    }
    handlePayment();
  };
  
  return (
    <div className="space-y-5">
      {/* Provider Selection */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-3 block">
          Opérateur
        </label>
        <div className="grid grid-cols-3 gap-3">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => setProvider(p.id)}
              disabled={isProcessing}
              className={cn(
                "flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200",
                provider === p.id 
                  ? "border-primary bg-primary/5 shadow-soft-sm" 
                  : "border-border bg-muted/30 hover:border-muted-foreground/30",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full bg-gradient-to-br mb-2",
                p.color
              )} />
              <span className="text-xs font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Numéro de téléphone
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
            <span className="text-lg">🇧🇯</span>
            <span className="text-sm font-medium">+229</span>
          </div>
          <Input
            type="tel"
            placeholder="97 00 00 00"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            className="pl-20 h-12 rounded-xl border-border focus:ring-2 focus:ring-primary/20"
            maxLength={10}
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* Info text */}
      <p className="text-sm text-muted-foreground">
        Vous recevrez une notification pour confirmer la transaction.
      </p>

      {/* Submit Button */}
      <Button
        onClick={handleClick}
        disabled={isProcessing || phoneNumber.trim().length < 8}
        className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl text-base font-medium"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            {isWithdrawal ? 'Retrait en cours...' : 'Paiement en cours...'}
          </>
        ) : (
          isWithdrawal ? 'Effectuer le retrait' : 'Effectuer le paiement'
        )}
      </Button>
    </div>
  );
};

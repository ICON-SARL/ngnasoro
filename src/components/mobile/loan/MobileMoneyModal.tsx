

import React, { useState } from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMobileMoneyOperations } from '@/hooks/mobile-money';
import { CheckCircle, Smartphone, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { mobileMoneyProviders } from '@/config/mobileMoneyProviders';

interface MobileMoneyModalProps {
  onClose: () => void;
  isWithdrawal?: boolean;
  amount?: number;
  loanId?: string;
}

const quickAmounts = [5000, 10000, 25000, 50000];

const formatAmount = (value: number): string => {
  return new Intl.NumberFormat('fr-FR').format(value);
};

const MobileMoneyModal: React.FC<MobileMoneyModalProps> = ({
  onClose,
  isWithdrawal = false,
  amount: initialAmount = 0,
  loanId
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('orange');
  const [amount, setAmount] = useState(initialAmount > 0 ? initialAmount.toString() : '');
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { processPayment, processWithdrawal, isProcessingPayment, isProcessingWithdrawal } = useMobileMoneyOperations();

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    setAmount(numericValue);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!phoneNumber || phoneNumber.length < 8) {
      setError('Numéro de téléphone invalide');
      return;
    }
    
    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      setError('Montant invalide');
      return;
    }

    setIsProcessing(true);
    
    try {
      const description = isWithdrawal 
        ? `Retrait vers ${provider}` 
        : loanId ? 'Remboursement de prêt' : `Recharge via ${provider}`;
      
      let result: boolean;
      
      if (isWithdrawal) {
        result = await processWithdrawal({
          phoneNumber,
          amount: amountValue,
          provider,
          description
        });
      } else {
        result = await processPayment({
          phoneNumber,
          amount: amountValue,
          provider,
          description,
          loanId
        });
      }

      if (result) {
        setSuccess(true);
      } else {
        setError('La transaction a échoué. Veuillez réessayer.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isProcessing || isProcessingPayment || isProcessingWithdrawal;
  const displayAmount = amount ? formatAmount(parseInt(amount)) : '0';
  const hasFixedAmount = initialAmount > 0;

  // Success state
  if (success) {
    return (
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-b from-primary/5 to-background p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-primary" />
          </motion.div>
          
          <h3 className="text-xl font-semibold mb-2">
            {isWithdrawal ? 'Retrait initié' : 'Recharge initiée'}
          </h3>
          <p className="text-muted-foreground mb-2">
            {isWithdrawal ? 'Votre retrait a été initié avec succès' : 'Confirmez sur votre téléphone'}
          </p>
          <p className="text-2xl font-bold text-primary mb-6">
            {displayAmount} FCFA
          </p>
          
          <Button 
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Fermer
          </Button>
        </motion.div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {isWithdrawal ? 'Retrait Mobile Money' : 'Recharge Mobile Money'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isWithdrawal ? 'Vers votre numéro' : 'Depuis votre numéro'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Selection */}
        <div className="mb-5">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Opérateur
          </label>
          <div className="grid grid-cols-4 gap-2">
            {mobileMoneyProviders.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200",
                  provider === p.id 
                    ? "border-primary bg-primary/5 shadow-soft-sm" 
                    : "border-border bg-muted/30 hover:border-muted-foreground/30"
                )}
              >
                <img 
                  src={p.logo} 
                  alt={p.name} 
                  className="w-10 h-10 rounded-lg object-contain mb-1"
                />
                <span className="text-[10px] font-medium text-center leading-tight">
                  {p.shortName}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Number */}
        <div className="mb-5">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Numéro de téléphone
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
              <span className="text-lg">🇲🇱</span>
              <span className="text-sm font-medium">+223</span>
            </div>
            <Input
              type="tel"
              placeholder="6X XX XX XX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              className="pl-20 h-12 rounded-xl border-border focus:ring-2 focus:ring-primary/20"
              maxLength={10}
            />
          </div>
        </div>

        {/* Amount */}
        <div className="mb-5">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Montant
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="0"
              value={amount ? formatAmount(parseInt(amount)) : ''}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="h-12 rounded-xl border-border focus:ring-2 focus:ring-primary/20 pr-16 text-lg font-semibold"
              disabled={hasFixedAmount}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                FCFA
              </span>
            </div>
          </div>
          
          {/* Quick Amounts - Only show if no fixed amount */}
          {!hasFixedAmount && (
            <div className="flex gap-2 mt-3">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  onClick={() => handleQuickAmount(qa)}
                  className={cn(
                    "flex-1 py-2 text-xs font-medium rounded-lg transition-all",
                    amount === qa.toString()
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {formatAmount(qa)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !phoneNumber || !amount}
          className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl text-base font-medium"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            isWithdrawal ? 'Retirer vers Mobile' : 'Recharger mon compte'
          )}
        </Button>
      </div>
    </DialogContent>
  );
};

export default MobileMoneyModal;

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Smartphone, CheckCircle } from 'lucide-react';
import { Loan } from '@/types/sfdClients';

interface MobileMoneyRepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  suggestedAmount: number;
  onPaymentSuccess: () => void;
}

type MobileOperator = 'orange_money' | 'mtn_money' | 'moov_money';

const operatorConfig: Record<MobileOperator, { name: string; color: string; icon: string }> = {
  orange_money: { name: 'Orange Money', color: 'from-orange-500 to-orange-600', icon: '🟠' },
  mtn_money: { name: 'MTN Mobile Money', color: 'from-yellow-500 to-yellow-600', icon: '🟡' },
  moov_money: { name: 'Moov Money', color: 'from-blue-500 to-blue-600', icon: '🔵' },
};

const MobileMoneyRepaymentModal = ({
  isOpen,
  onClose,
  loan,
  suggestedAmount,
  onPaymentSuccess,
}: MobileMoneyRepaymentModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'success'>('select');
  const [selectedOperator, setSelectedOperator] = useState<MobileOperator>('orange_money');
  const [amount, setAmount] = useState(suggestedAmount.toString());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un montant valide',
        variant: 'destructive',
      });
      return;
    }
    if (!phoneNumber || phoneNumber.length < 8) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un numéro de téléphone valide',
        variant: 'destructive',
      });
      return;
    }
    setStep('confirm');
  };

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setStep('processing');

    try {
      // Record the payment in the database
      const { error: paymentError } = await supabase
        .from('loan_payments')
        .insert({
          loan_id: loan.id,
          amount: parseFloat(amount),
          payment_method: 'mobile_money',
          status: 'completed',
          reference: `MM-${Date.now()}-${selectedOperator}`,
        });

      if (paymentError) throw paymentError;

      // Update the loan's remaining amount
      const newRemainingAmount = Math.max(0, (loan.remaining_amount || loan.total_amount) - parseFloat(amount));
      
      const currentStatus = loan.status as string;
      const newStatus = newRemainingAmount <= 0 ? 'completed' : currentStatus;
      
      const { error: loanError } = await supabase
        .from('sfd_loans')
        .update({
          remaining_amount: newRemainingAmount,
          status: newStatus as any,
        })
        .eq('id', loan.id);

      if (loanError) throw loanError;

      // Log the activity
      await supabase.from('loan_activities').insert({
        loan_id: loan.id,
        activity_type: 'payment_received',
        description: `Paiement de ${parseFloat(amount).toLocaleString()} FCFA via ${operatorConfig[selectedOperator].name}`,
      });

      setStep('success');
      
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        resetModal();
      }, 2000);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Erreur de paiement',
        description: error.message || 'Une erreur est survenue lors du paiement',
        variant: 'destructive',
      });
      setStep('select');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setStep('select');
    setAmount(suggestedAmount.toString());
    setPhoneNumber('');
    setSelectedOperator('orange_money');
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetModal();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === 'success' ? '✓ Paiement réussi' : 'Remboursement Mobile Money'}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-6 py-4">
            {/* Operator Selection */}
            <div className="space-y-3">
              <Label>Choisir votre opérateur</Label>
              <RadioGroup
                value={selectedOperator}
                onValueChange={(v) => setSelectedOperator(v as MobileOperator)}
                className="space-y-2"
              >
                {Object.entries(operatorConfig).map(([key, config]) => (
                  <div
                    key={key}
                    className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedOperator === key
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30'
                    }`}
                    onClick={() => setSelectedOperator(key as MobileOperator)}
                  >
                    <RadioGroupItem value={key} id={key} />
                    <span className="text-2xl">{config.icon}</span>
                    <Label htmlFor={key} className="flex-1 cursor-pointer font-medium">
                      {config.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ex: 07 XX XX XX XX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (FCFA)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 rounded-xl text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Mensualité suggérée: {suggestedAmount.toLocaleString()} FCFA
              </p>
            </div>

            <Button
              onClick={handleConfirm}
              className={`w-full h-12 rounded-xl bg-gradient-to-r ${operatorConfig[selectedOperator].color}`}
            >
              Continuer
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6 py-4">
            <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Opérateur</span>
                <span className="font-medium">
                  {operatorConfig[selectedOperator].icon} {operatorConfig[selectedOperator].name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Téléphone</span>
                <span className="font-medium">{phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-bold text-lg">{parseFloat(amount).toLocaleString()} FCFA</span>
              </div>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Vous allez recevoir une notification sur votre téléphone pour confirmer le paiement.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('select')}
                className="flex-1 h-12 rounded-xl"
              >
                Retour
              </Button>
              <Button
                onClick={handleProcessPayment}
                className={`flex-1 h-12 rounded-xl bg-gradient-to-r ${operatorConfig[selectedOperator].color}`}
              >
                Confirmer
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Traitement en cours...</p>
            <p className="text-sm text-muted-foreground">
              Veuillez confirmer le paiement sur votre téléphone
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-lg font-medium">Paiement effectué !</p>
            <p className="text-sm text-muted-foreground">
              {parseFloat(amount).toLocaleString()} FCFA ont été débités
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MobileMoneyRepaymentModal;

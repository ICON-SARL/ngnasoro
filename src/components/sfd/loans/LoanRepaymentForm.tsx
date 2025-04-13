
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loan } from '@/types/sfdClients';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { formatDateToLocale } from '@/utils/dateUtils';
import { AlertCircle, CreditCard, Landmark } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoanRepaymentFormProps {
  loan: Loan;
  onCancel: () => void;
  onSuccess: () => void;
}

export function LoanRepaymentForm({ loan, onCancel, onSuccess }: LoanRepaymentFormProps) {
  const { recordPayment } = useSfdLoans();
  const [amount, setAmount] = useState<string>(loan.monthly_payment?.toString() || '');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await recordPayment.mutateAsync({
        loanId: loan.id,
        amount: parseFloat(amount),
        paymentMethod
      });
      onSuccess();
    } catch (error) {
      console.error("Error recording payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Calculate remaining balance (simplified demo version)
  const calculateRemainingBalance = () => {
    // In a real application, this would be calculated from actual payment records
    const totalLoanAmount = loan.amount * (1 + (loan.interest_rate / 100));
    const randomPercentagePaid = Math.random() * 0.6; // Random value between 0-60% paid
    return totalLoanAmount * (1 - randomPercentagePaid);
  };

  const remainingBalance = calculateRemainingBalance();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="bg-muted rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Client:</span>
          <span className="text-sm font-medium">
            {loan.client_name || `Client #${loan.client_id?.substring(0, 8)}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Montant du prêt:</span>
          <span className="text-sm font-medium">{formatCurrency(loan.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Durée:</span>
          <span className="text-sm font-medium">{loan.duration_months} mois</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Mensualité:</span>
          <span className="text-sm font-medium">{formatCurrency(loan.monthly_payment)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Solde restant estimé:</span>
          <span className="text-sm font-medium">{formatCurrency(remainingBalance)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Date:</span>
          <span className="text-sm font-medium">{formatDateToLocale(new Date().toISOString())}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Montant du paiement</Label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min={0}
            className="pl-12"
          />
          <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-muted-foreground">
            FCFA
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-method">Mode de paiement</Label>
        <Select
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          required
        >
          <SelectTrigger id="payment-method">
            <SelectValue placeholder="Sélectionner un mode de paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">
              <div className="flex items-center">
                <Landmark className="h-4 w-4 mr-2" />
                Espèces
              </div>
            </SelectItem>
            <SelectItem value="bank_transfer">
              <div className="flex items-center">
                <Landmark className="h-4 w-4 mr-2" />
                Virement bancaire
              </div>
            </SelectItem>
            <SelectItem value="mobile_money">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Mobile Money
              </div>
            </SelectItem>
            <SelectItem value="cheque">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Chèque
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-700" />
        <AlertDescription className="text-blue-700">
          Ce paiement sera enregistré immédiatement et une notification sera envoyée au client.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          {isSubmitting ? "Traitement..." : "Enregistrer le paiement"}
        </Button>
      </div>
    </form>
  );
}

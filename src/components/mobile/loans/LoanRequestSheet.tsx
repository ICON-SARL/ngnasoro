import { useState, useEffect } from 'react';
import { LoanPlan } from '@/types/sfdClients';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface LoanRequestSheetProps {
  plan: LoanPlan;
  sfdId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoanRequestSheet = ({ plan, sfdId, open, onOpenChange }: LoanRequestSheetProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState(plan.min_amount);
  const [durationMonths, setDurationMonths] = useState(plan.duration_months);
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    const monthlyRate = plan.interest_rate / 100 / 12;
    const totalAmount = amount * (1 + monthlyRate * durationMonths);
    return totalAmount / durationMonths;
  };

  const calculateTotalAmount = () => {
    const monthlyRate = plan.interest_rate / 100 / 12;
    return amount * (1 + monthlyRate * durationMonths);
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalAmount = calculateTotalAmount();

  const handleSubmit = async () => {
    if (!user?.id || !sfdId) {
      toast({
        title: 'Erreur',
        description: 'Utilisateur non authentifié',
        variant: 'destructive',
      });
      return;
    }

    if (!purpose.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez préciser l\'objet du prêt',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get client ID
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .maybeSingle();

      if (clientError || !clientData) {
        throw new Error('Vous n\'êtes pas encore client de cette SFD');
      }

      // Create loan via edge function
      const { data, error } = await supabase.functions.invoke('loan-manager', {
        body: {
          action: 'create_loan',
          data: {
            loan: {
              client_id: clientData.id,
              sfd_id: sfdId,
              amount: amount,
              duration_months: durationMonths,
              interest_rate: plan.interest_rate,
              purpose: purpose,
              loan_plan_id: plan.id,
              monthly_payment: monthlyPayment,
              total_amount: totalAmount,
              remaining_amount: totalAmount,
            }
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de prêt a été soumise avec succès',
      });

      onOpenChange(false);
      
      // Refresh the page to show the new loan
      window.location.reload();
    } catch (error: any) {
      console.error('Error submitting loan request:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
          <SheetTitle className="text-2xl">Demande de {plan.name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto max-h-[calc(85vh-140px)] pb-20">
          {/* Plan Info */}
          <div className="bg-primary/5 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montant disponible</span>
              <span className="font-semibold">
                {plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Durée</span>
              <span className="font-semibold">{plan.duration_months} mois</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taux d'intérêt</span>
              <span className="font-semibold">{plan.interest_rate}% / an</span>
            </div>
          </div>

          {/* Amount Slider */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Montant souhaité</Label>
            <div className="text-center mb-4">
              <span className="text-4xl font-bold text-primary">
                {amount.toLocaleString()}
              </span>
              <span className="text-lg text-muted-foreground ml-2">FCFA</span>
            </div>
            <Slider
              value={[amount]}
              onValueChange={(values) => setAmount(values[0])}
              min={plan.min_amount}
              max={plan.max_amount}
              step={10000}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{plan.min_amount.toLocaleString()}</span>
              <span>{plan.max_amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Durée (mois)</Label>
            <Select
              value={durationMonths.toString()}
              onValueChange={(value) => setDurationMonths(parseInt(value))}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 6, 9, 12, 18, 24].map(months => (
                  <SelectItem key={months} value={months.toString()}>
                    {months} mois
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purpose */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Objet du prêt</Label>
            <Textarea
              placeholder="Décrivez l'utilisation prévue du prêt..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="min-h-24 rounded-xl"
            />
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold text-lg mb-3">Récapitulatif</h3>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Montant</span>
              <span className="font-semibold">{amount.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durée</span>
              <span className="font-semibold">{durationMonths} mois</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taux</span>
              <span className="font-semibold">{plan.interest_rate}%</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mensualité</span>
              <span className="font-bold text-primary text-lg">
                {Math.round(monthlyPayment).toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total à rembourser</span>
              <span className="font-bold text-lg">
                {Math.round(totalAmount).toLocaleString()} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !purpose.trim()}
              className="flex-1 rounded-full bg-gradient-to-r from-primary to-purple-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Soumettre la demande'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LoanRequestSheet;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface LoanPlan {
  id: string;
  name: string;
  description?: string;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  duration_months: number;
  sfd_id: string;
}

interface SfdClient {
  id: string;
  kyc_level: number;
  sfd_id: string;
}

const LoanApplicationForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [clientData, setClientData] = useState<SfdClient | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<LoanPlan | null>(null);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycLimit, setKycLimit] = useState(0);

  useEffect(() => {
    if (user) {
      fetchClientData();
    }
  }, [user]);

  const fetchClientData = async () => {
    try {
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('id, kyc_level, sfd_id')
        .eq('user_id', user?.id || '')
        .single();

      if (clientError) throw clientError;

      setClientData(client);

      const limits: Record<number, number> = {
        1: 50000,
        2: 500000,
        3: Infinity,
      };
      setKycLimit(limits[client.kyc_level] || 50000);

      const { data: plans, error: plansError } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', client.sfd_id)
        .eq('is_active', true);

      if (plansError) throw plansError;
      setLoanPlans(plans || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    const plan = loanPlans.find(p => p.id === planId);
    setSelectedPlan(plan || null);
    setAmount('');
  };

  const validateAmount = (): boolean => {
    const amountNum = parseFloat(amount);

    if (!selectedPlan) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un plan de prêt',
        variant: 'destructive',
      });
      return false;
    }

    if (!amountNum || amountNum <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un montant valide',
        variant: 'destructive',
      });
      return false;
    }

    if (amountNum < selectedPlan.min_amount) {
      toast({
        title: 'Montant trop faible',
        description: `Le montant minimum pour ce plan est ${selectedPlan.min_amount.toLocaleString()} FCFA`,
        variant: 'destructive',
      });
      return false;
    }

    if (amountNum > selectedPlan.max_amount) {
      toast({
        title: 'Montant trop élevé',
        description: `Le montant maximum pour ce plan est ${selectedPlan.max_amount.toLocaleString()} FCFA`,
        variant: 'destructive',
      });
      return false;
    }

    if (amountNum > kycLimit) {
      toast({
        title: 'Limite KYC dépassée',
        description: `Votre niveau KYC ${clientData?.kyc_level} limite les prêts à ${kycLimit.toLocaleString()} FCFA`,
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const calculateLoanDetails = () => {
    if (!selectedPlan || !amount) return null;

    const principal = parseFloat(amount);
    const totalAmount = principal * (1 + selectedPlan.interest_rate);
    const monthlyPayment = totalAmount / selectedPlan.duration_months;

    return {
      principal,
      totalAmount,
      monthlyPayment,
      interestAmount: totalAmount - principal,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAmount() || !clientData || !selectedPlan) return;

    setSubmitting(true);
    try {
      const loanDetails = calculateLoanDetails();
      if (!loanDetails) throw new Error('Calcul impossible');

      const { error } = await supabase
        .from('sfd_loans')
        .insert({
          sfd_id: clientData.sfd_id,
          client_id: clientData.id,
          loan_plan_id: selectedPlan.id,
          amount: loanDetails.principal,
          interest_rate: selectedPlan.interest_rate,
          duration_months: selectedPlan.duration_months,
          monthly_payment: loanDetails.monthlyPayment,
          total_amount: loanDetails.totalAmount,
          remaining_amount: loanDetails.totalAmount,
          purpose: purpose,
          status: 'pending',
        });

      if (error) throw error;

      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action: 'create_loan_request',
          category: 'loans',
          severity: 'info',
          status: 'success',
          details: {
            amount: loanDetails.principal,
            plan_id: selectedPlan.id,
            plan_name: selectedPlan.name,
          },
        });

      toast({
        title: 'Succès',
        description: 'Votre demande de prêt a été soumise avec succès',
      });

      setSelectedPlan(null);
      setAmount('');
      setPurpose('');
    } catch (error) {
      console.error('Error submitting loan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de soumettre la demande',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const loanDetails = calculateLoanDetails();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demande de Prêt</CardTitle>
          <CardDescription>
            Remplissez le formulaire pour soumettre votre demande de prêt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Votre niveau KYC actuel est <Badge variant="outline">Niveau {clientData?.kyc_level}</Badge>
              {' '}avec une limite de prêt de <strong>{kycLimit === Infinity ? 'sans limite' : `${kycLimit.toLocaleString()} FCFA`}</strong>
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="plan">Plan de prêt *</Label>
            <Select onValueChange={handlePlanSelect} value={selectedPlan?.id}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un plan" />
              </SelectTrigger>
              <SelectContent>
                {loanPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - {plan.interest_rate * 100}% sur {plan.duration_months} mois
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlan && (
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <p><strong>Description:</strong> {selectedPlan.description || 'N/A'}</p>
                  <p><strong>Montant:</strong> {selectedPlan.min_amount.toLocaleString()} - {selectedPlan.max_amount.toLocaleString()} FCFA</p>
                  <p><strong>Taux d'intérêt:</strong> {selectedPlan.interest_rate * 100}%</p>
                  <p><strong>Durée:</strong> {selectedPlan.duration_months} mois</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="amount">Montant demandé (FCFA) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="Ex: 100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                disabled={!selectedPlan}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="purpose">Objet du prêt *</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="purpose"
                placeholder="Décrivez l'utilisation prévue du prêt..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="pl-10 min-h-[100px]"
                required
              />
            </div>
          </div>

          {loanDetails && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Montant principal:</span>
                  <span className="font-semibold">{loanDetails.principal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Intérêts ({selectedPlan?.interest_rate * 100}%):</span>
                  <span className="font-semibold">{loanDetails.interestAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Montant total à rembourser:</span>
                  <span>{loanDetails.totalAmount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between items-center mt-4 p-3 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Paiement mensuel:</span>
                  </div>
                  <span className="font-bold text-primary">{loanDetails.monthlyPayment.toLocaleString()} FCFA</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Sur {selectedPlan?.duration_months} mois
                </p>
              </CardContent>
            </Card>
          )}

          <Button type="submit" className="w-full" disabled={submitting || !selectedPlan}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Soumission en cours...
              </>
            ) : (
              'Soumettre la demande'
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default LoanApplicationForm;

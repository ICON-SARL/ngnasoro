
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Circle, CircleDollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';

export default function InstantLoanForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanDuration, setLoanDuration] = useState(6);
  const [loanPurpose, setLoanPurpose] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalRepayment, setTotalRepayment] = useState(0);
  const [interestRate, setInterestRate] = useState(5.5);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEligible, setIsEligible] = useState(false);
  
  // Fetch client information
  useEffect(() => {
    if (user && activeSfdId) {
      const fetchClientInfo = async () => {
        setIsLoading(true);
        try {
          // Check if user has a validated client profile
          const { data, error } = await supabase
            .from('sfd_clients')
            .select('*')
            .eq('user_id', user.id)
            .eq('sfd_id', activeSfdId)
            .eq('status', 'validated')
            .single();
          
          if (error) {
            console.error('Error fetching client info:', error);
            setIsEligible(false);
          } else if (data) {
            setClientInfo(data);
            setIsEligible(true);
          } else {
            setIsEligible(false);
          }
        } catch (error) {
          console.error('Error:', error);
          setIsEligible(false);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchClientInfo();
    }
  }, [user, activeSfdId]);
  
  // Calculate loan repayment values
  useEffect(() => {
    // Simple interest calculation
    const monthlyInterestRate = interestRate / 100 / 12;
    const numerator = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanDuration);
    const denominator = Math.pow(1 + monthlyInterestRate, loanDuration) - 1;
    const monthly = numerator / denominator;
    
    setMonthlyPayment(Math.round(monthly));
    setTotalRepayment(Math.round(monthly * loanDuration));
  }, [loanAmount, loanDuration, interestRate]);
  
  const handleAmountChange = (value: number[]) => {
    setLoanAmount(value[0]);
  };
  
  const handleDurationChange = (value: string) => {
    setLoanDuration(parseInt(value));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !activeSfdId) {
      toast({
        title: "Erreur d'authentification",
        description: "Veuillez vous connecter pour demander un prêt",
        variant: "destructive",
      });
      return;
    }
    
    if (!clientInfo) {
      toast({
        title: "Profil incomplet",
        description: "Vous devez avoir un profil client validé pour demander un prêt",
        variant: "destructive",
      });
      return;
    }
    
    if (!loanPurpose) {
      toast({
        title: "Information manquante",
        description: "Veuillez préciser l'objet du prêt",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create loan application
      const { data, error } = await supabase
        .from('sfd_loans')
        .insert({
          client_id: clientInfo.id,
          sfd_id: activeSfdId,
          amount: loanAmount,
          duration_months: loanDuration,
          interest_rate: interestRate,
          monthly_payment: monthlyPayment,
          purpose: loanPurpose,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add loan creation activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: data.id,
          activity_type: 'loan_created',
          description: `Prêt de ${loanAmount.toLocaleString()} FCFA créé par le client`,
          performed_by: user.id
        });
      
      toast({
        title: "Demande soumise avec succès",
        description: "Votre demande de prêt a été envoyée et est en cours d'examen",
        variant: "default",
      });
      
      // Navigate to loan agreement page
      navigate('/mobile-flow/loan-agreement', { 
        state: { 
          loanId: data.id,
          loanAmount,
          loanDuration,
          monthlyPayment,
          totalRepayment,
          interestRate
        } 
      });
      
    } catch (error: any) {
      console.error('Error submitting loan application:', error);
      toast({
        title: "Erreur lors de la soumission",
        description: error.message || "Une erreur est survenue lors de la soumission de votre demande",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }
  
  if (!isEligible) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Demande de Prêt</CardTitle>
          <CardDescription className="text-center">
            Vous n'êtes pas éligible pour demander un prêt
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Profil non validé</h3>
          <p className="text-muted-foreground mb-4">
            Vous devez avoir un profil client validé pour pouvoir demander un prêt.
            Veuillez contacter votre SFD pour valider votre profil.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/mobile-flow')}
            className="mt-2"
          >
            Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Demande de Prêt Instantané</CardTitle>
        <CardDescription>
          Configurez votre prêt selon vos besoins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amount">Montant du prêt</Label>
              <span className="font-medium">{loanAmount.toLocaleString()} FCFA</span>
            </div>
            <Slider
              id="amount"
              value={[loanAmount]}
              min={50000}
              max={1000000}
              step={10000}
              onValueChange={handleAmountChange}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50 000</span>
              <span>1 000 000</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Durée du prêt</Label>
            <Select 
              value={loanDuration.toString()} 
              onValueChange={handleDurationChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez la durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 mois</SelectItem>
                <SelectItem value="6">6 mois</SelectItem>
                <SelectItem value="9">9 mois</SelectItem>
                <SelectItem value="12">12 mois</SelectItem>
                <SelectItem value="18">18 mois</SelectItem>
                <SelectItem value="24">24 mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purpose">Objet du prêt</Label>
            <Input
              id="purpose"
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value)}
              placeholder="Ex: Achat de matériel agricole"
              className="w-full"
              required
            />
          </div>
          
          <div className="bg-muted rounded-md p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Taux d'intérêt annuel</span>
              <span className="font-medium">{interestRate}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Paiement mensuel</span>
              <span className="font-medium">{monthlyPayment.toLocaleString()} FCFA</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Remboursement total</span>
              <span className="font-medium">{totalRepayment.toLocaleString()} FCFA</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Circle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Décaissement rapide</h4>
                <p className="text-sm text-muted-foreground">Recevez les fonds dans votre compte en 24-48h après approbation</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Circle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Remboursement flexible</h4>
                <p className="text-sm text-muted-foreground">Payez par mobile money, transfert bancaire ou en espèces</p>
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#0D6A51] hover:bg-[#0A5A45]"
            disabled={isProcessing}
          >
            {isProcessing ? "Traitement en cours..." : "Soumettre ma demande"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

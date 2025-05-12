import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Calendar, Calculator, CreditCard, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { useLoanApplication } from '@/hooks/useLoanApplication';

interface LoanPlan {
  id: string;
  name: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  sfd_id: string;
}

const MobileLoanApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const planId = location.state?.planId;
  
  const [plan, setPlan] = useState<LoanPlan | null>(null);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [purpose, setPurpose] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  
  // Récupérer les détails du plan de prêt
  useEffect(() => {
    const fetchLoanPlan = async () => {
      if (!planId) return;
      
      try {
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .select('*')
          .eq('id', planId)
          .single();
          
        if (error) throw error;
        
        setPlan(data);
        setLoanAmount(data.min_amount);
        setDuration(data.min_duration);
      } catch (error) {
        console.error('Erreur lors du chargement du plan de prêt:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les détails du plan de prêt',
          variant: 'destructive',
        });
      }
    };
    
    fetchLoanPlan();
  }, [planId, toast]);
  
  // Calculer le paiement mensuel
  useEffect(() => {
    if (plan && loanAmount > 0 && duration > 0) {
      // Calculer le montant total à rembourser
      const interest = (loanAmount * plan.interest_rate * duration) / (12 * 100);
      const fees = (loanAmount * plan.fees) / 100;
      const totalAmount = loanAmount + interest + fees;
      
      // Calculer le paiement mensuel
      const monthly = totalAmount / duration;
      setMonthlyPayment(monthly);
    }
  }, [plan, loanAmount, duration]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Non connecté',
        description: 'Vous devez être connecté pour demander un prêt',
        variant: 'destructive',
      });
      return;
    }
    
    if (!plan) {
      toast({
        title: 'Erreur',
        description: 'Informations du plan de prêt manquantes',
        variant: 'destructive',
      });
      return;
    }
    
    if (!purpose.trim()) {
      toast({
        title: 'Champ requis',
        description: 'Veuillez indiquer l\'objet du prêt',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Vérifier si l'utilisateur a déjà un compte client dans cette SFD
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('sfd_id', plan.sfd_id)
        .maybeSingle();
        
      if (clientError) {
        console.error("Erreur lors de la vérification du client:", clientError);
        throw new Error("Erreur lors de la vérification de votre compte client");
      }
      
      if (!clientData) {
        toast({
          title: 'Non inscrit',
          description: 'Vous devez d\'abord adhérer à cette SFD pour pouvoir demander un prêt',
          variant: 'destructive',
        });
        navigate('/mobile-flow/sfd-connection');
        return;
      }
      
      // Créer la demande de prêt via la fonction du hook
      const { submitApplication } = useLoanApplication(plan.sfd_id);
      await submitApplication.mutateAsync({
        amount: loanAmount,
        duration_months: duration,
        purpose: purpose,
        loan_plan_id: plan.id
      });
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de prêt a été soumise avec succès. Vous serez notifié de son statut.',
      });
      
      navigate('/mobile-flow/my-loans');
    } catch (error: any) {
      console.error('Erreur lors de la soumission de la demande de prêt:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de soumettre votre demande de prêt',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white p-4 shadow-sm flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/mobile-flow/loan-plans')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Demande de prêt</h1>
        </div>
        
        <div className="p-4 flex items-center justify-center min-h-[60vh] flex-col">
          <p className="text-gray-500 mb-4">Chargement du plan de prêt...</p>
          <Button onClick={() => navigate('/mobile-flow/loan-plans')}>
            Retour aux plans
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/loan-plans')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Demande de prêt</h1>
      </div>
      
      <div className="p-4">
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg">{plan.name}</h2>
            <p className="text-sm text-gray-500 mb-3">Personnalisez votre prêt</p>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="amount">Montant du prêt</Label>
                    <span className="text-sm font-medium">{loanAmount.toLocaleString()} FCFA</span>
                  </div>
                  <Slider
                    id="amount"
                    min={plan.min_amount}
                    max={plan.max_amount}
                    step={1000}
                    value={[loanAmount]}
                    onValueChange={(values) => setLoanAmount(values[0])}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{plan.min_amount.toLocaleString()} FCFA</span>
                    <span>{plan.max_amount.toLocaleString()} FCFA</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="duration">Durée du prêt</Label>
                    <span className="text-sm font-medium">{duration} mois</span>
                  </div>
                  <Slider
                    id="duration"
                    min={plan.min_duration}
                    max={plan.max_duration}
                    step={1}
                    value={[duration]}
                    onValueChange={(values) => setDuration(values[0])}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{plan.min_duration} mois</span>
                    <span>{plan.max_duration} mois</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="purpose">Objet du prêt</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Décrivez pourquoi vous demandez ce prêt"
                    className="mt-1"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                  />
                </div>
                
                <Separator />
                
                <div className="p-3 bg-[#0D6A51]/5 rounded-lg">
                  <h3 className="font-medium mb-2">Récapitulatif</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Montant:</p>
                      <p className="font-medium">{loanAmount.toLocaleString()} FCFA</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Durée:</p>
                      <p className="font-medium">{duration} mois</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taux d'intérêt:</p>
                      <p className="font-medium">{plan.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Frais:</p>
                      <p className="font-medium">{plan.fees}%</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t mt-2">
                      <p className="text-muted-foreground">Paiement mensuel:</p>
                      <p className="font-semibold text-lg">{monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })} FCFA/mois</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Soumission en cours...' : 'Soumettre ma demande'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileLoanApplicationPage;

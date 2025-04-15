
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Percent, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LoanPlan {
  id: string;
  name: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
}

const MobileLoanSimulatorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const planId = location.state?.planId;
  
  const [plan, setPlan] = useState<LoanPlan | null>(null);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  
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
  
  // Calculer les différentes valeurs
  const calculateLoanDetails = () => {
    if (!plan || loanAmount <= 0 || duration <= 0) {
      return {
        interest: 0,
        fees: 0,
        totalAmount: 0,
        monthlyPayment: 0,
      };
    }
    
    // Calcul des intérêts (sur la durée totale)
    const interest = (loanAmount * plan.interest_rate * duration) / (12 * 100);
    
    // Calcul des frais (fixes, appliqués une seule fois)
    const fees = (loanAmount * plan.fees) / 100;
    
    // Montant total à rembourser
    const totalAmount = loanAmount + interest + fees;
    
    // Paiement mensuel
    const monthlyPayment = totalAmount / duration;
    
    return {
      interest,
      fees,
      totalAmount,
      monthlyPayment,
    };
  };
  
  const { interest, fees, totalAmount, monthlyPayment } = calculateLoanDetails();
  
  const handleApply = () => {
    navigate('/mobile-flow/loan-application', { 
      state: { planId: plan?.id } 
    });
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
          <h1 className="text-xl font-semibold">Simulateur de prêt</h1>
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/loan-plans')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Simulateur de prêt</h1>
      </div>
      
      <div className="p-4">
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg">{plan.name}</h2>
            <p className="text-sm text-gray-500 mb-4">Simulez votre prêt selon vos besoins</p>
            
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
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Récapitulatif du prêt</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Montant emprunté</p>
                  <p className="font-semibold">{loanAmount.toLocaleString()} FCFA</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                  <Percent className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Intérêts + Frais</p>
                  <p className="font-semibold">{(interest + fees).toLocaleString(undefined, { maximumFractionDigits: 0 })} FCFA</p>
                  <p className="text-xs text-gray-500">
                    ({plan.interest_rate}% sur {duration} mois + {plan.fees}% de frais)
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remboursement mensuel</p>
                  <p className="font-semibold">{monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })} FCFA/mois</p>
                  <p className="text-xs text-gray-500">sur {duration} mois</p>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between mb-1">
                  <p className="text-sm">Montant total à rembourser:</p>
                  <p className="font-semibold">{totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} FCFA</p>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <p className="text-gray-500">Coût total du crédit:</p>
                  <p className="text-gray-500">{(interest + fees).toLocaleString(undefined, { maximumFractionDigits: 0 })} FCFA</p>
                </div>
                
                <Button 
                  className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  onClick={handleApply}
                >
                  Faire une demande
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  Cette simulation est donnée à titre indicatif et ne constitue pas une offre de prêt.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileLoanSimulatorPage;

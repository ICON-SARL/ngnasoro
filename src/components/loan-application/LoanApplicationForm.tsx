
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Building,
  Calculator,
  Calendar,
  ChevronLeft,
  HelpCircle,
  Loader2,
} from 'lucide-react';

interface LoanPlan {
  id: string;
  name: string;
  description: string | null;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  requirements: string[];
  is_active: boolean;
  sfd_id: string;
}

interface SFD {
  id: string;
  name: string;
  code: string;
  region: string | null;
}

const LoanApplicationForm = () => {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sfds, setSfds] = useState<SFD[]>([]);
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<LoanPlan[]>([]);
  
  const [selectedSfd, setSelectedSfd] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [amount, setAmount] = useState<number>(100000);
  const [duration, setDuration] = useState<number>(12);
  const [purpose, setPurpose] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  
  const [currentPlan, setCurrentPlan] = useState<LoanPlan | null>(null);
  
  // Fetch user's SFDs and loan plans
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        if (!user) return;
        
        // Fetch SFDs available to the user
        const { data: sfdData, error: sfdError } = await supabase
          .from('user_sfds')
          .select('sfds:sfd_id(*)')
          .eq('user_id', user.id);
          
        if (sfdError) throw sfdError;
        
        const availableSfds = sfdData.map(item => item.sfds) as SFD[];
        setSfds(availableSfds);
        
        // Set default SFD if activeSfdId is set
        if (activeSfdId) {
          setSelectedSfd(activeSfdId);
        } else if (availableSfds.length > 0) {
          setSelectedSfd(availableSfds[0].id);
        }
        
        // Fetch all active loan plans
        const { data: plansData, error: plansError } = await supabase
          .from('sfd_loan_plans')
          .select('*')
          .eq('is_active', true);
          
        if (plansError) throw plansError;
        
        setLoanPlans(plansData);
        
        // Filter plans for the selected SFD
        if (activeSfdId) {
          const filtered = plansData.filter(plan => plan.sfd_id === activeSfdId);
          setFilteredPlans(filtered);
          
          // Set default values from first plan
          if (filtered.length > 0) {
            const firstPlan = filtered[0];
            setCurrentPlan(firstPlan);
            setSelectedPlan(firstPlan.id);
            setAmount(firstPlan.min_amount);
            setDuration(firstPlan.min_duration);
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, activeSfdId]);
  
  // Update filtered plans when SFD changes
  useEffect(() => {
    if (selectedSfd) {
      const filtered = loanPlans.filter(plan => plan.sfd_id === selectedSfd);
      setFilteredPlans(filtered);
      
      // Reset plan selection
      setSelectedPlan('');
      setCurrentPlan(null);
    }
  }, [selectedSfd, loanPlans]);
  
  // Update current plan when plan changes
  useEffect(() => {
    if (selectedPlan) {
      const plan = loanPlans.find(p => p.id === selectedPlan);
      if (plan) {
        setCurrentPlan(plan);
        
        // Set default values from plan
        setAmount(plan.min_amount);
        setDuration(plan.min_duration);
      }
    }
  }, [selectedPlan, loanPlans]);
  
  const handleSfdChange = (value: string) => {
    setSelectedSfd(value);
  };
  
  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR') + ' FCFA';
  };
  
  const calculateMonthlyPayment = () => {
    if (!currentPlan) return 0;
    
    const monthlyInterestRate = currentPlan.interest_rate / 100 / 12;
    const numerator = amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, duration);
    const denominator = Math.pow(1 + monthlyInterestRate, duration) - 1;
    
    // Add fees
    const feeAmount = amount * (currentPlan.fees / 100);
    const totalLoanAmount = amount + feeAmount;
    
    return numerator / denominator;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedSfd || !selectedPlan || !currentPlan) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    if (amount < currentPlan.min_amount || amount > currentPlan.max_amount) {
      toast({
        title: "Montant invalide",
        description: `Le montant doit être compris entre ${formatCurrency(currentPlan.min_amount)} et ${formatCurrency(currentPlan.max_amount)}`,
        variant: "destructive",
      });
      return;
    }
    
    if (duration < currentPlan.min_duration || duration > currentPlan.max_duration) {
      toast({
        title: "Durée invalide",
        description: `La durée doit être comprise entre ${currentPlan.min_duration} et ${currentPlan.max_duration} mois`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get client ID for the user in this SFD
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('sfd_id', selectedSfd)
        .single();
        
      if (clientError) {
        throw new Error("Vous n'êtes pas enregistré comme client pour cette SFD");
      }
      
      const clientId = clientData.id;
      
      // Calculate monthly payment
      const monthlyPayment = calculateMonthlyPayment();
      
      // Create loan request
      const { data, error } = await supabase
        .from('sfd_loans')
        .insert({
          client_id: clientId,
          sfd_id: selectedSfd,
          amount: amount,
          duration_months: duration,
          interest_rate: currentPlan.interest_rate,
          monthly_payment: monthlyPayment,
          purpose: purpose,
          status: 'pending'
        })
        .select();
        
      if (error) throw error;
      
      // Create loan activity
      await supabase
        .from('loan_activities')
        .insert({
          loan_id: data[0].id,
          activity_type: 'loan_request_created',
          description: `Demande de prêt de ${formatCurrency(amount)} sur ${duration} mois créée`
        });
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été soumise avec succès et est en attente d'approbation",
      });
      
      // Redirect to loans page
      navigate('/loans');
    } catch (error: any) {
      console.error('Error submitting loan application:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de soumettre votre demande de prêt",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement des plans de prêt...</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/loans')} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <CardTitle>Demande de prêt</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="sfd">Institution financière (SFD)</Label>
              <Select value={selectedSfd} onValueChange={handleSfdChange} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une SFD" />
                </SelectTrigger>
                <SelectContent>
                  {sfds.map((sfd) => (
                    <SelectItem key={sfd.id} value={sfd.id}>
                      {sfd.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSfd && filteredPlans.length === 0 ? (
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Aucun plan de prêt disponible pour cette SFD. Veuillez sélectionner une autre institution ou contactez votre conseiller.
                </p>
              </div>
            ) : selectedSfd && (
              <div>
                <Label htmlFor="loanPlan">Type de prêt</Label>
                <Select value={selectedPlan} onValueChange={handlePlanChange} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un plan de prêt" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {currentPlan && (
              <>
                <div className="bg-blue-50 p-4 rounded-md space-y-2">
                  <div className="flex items-center gap-1 text-blue-600">
                    <HelpCircle className="h-4 w-4" />
                    <h4 className="text-sm font-medium">Informations du plan</h4>
                  </div>
                  <p className="text-sm text-blue-700">{currentPlan.description}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Calculator className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-700">
                        Taux: {currentPlan.interest_rate}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-700">
                        Frais: {currentPlan.fees}%
                      </span>
                    </div>
                  </div>
                  {currentPlan.requirements && currentPlan.requirements.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-blue-700">Conditions requises:</h5>
                      <ul className="text-xs pl-4 space-y-1 text-blue-700">
                        {currentPlan.requirements.map((req, idx) => (
                          <li key={idx} className="list-disc">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="amount">Montant du prêt</Label>
                  <div className="mb-2 font-bold text-xl text-center">{formatCurrency(amount)}</div>
                  <Slider
                    value={[amount]}
                    min={currentPlan.min_amount}
                    max={currentPlan.max_amount}
                    step={5000}
                    onValueChange={(values) => setAmount(values[0])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatCurrency(currentPlan.min_amount)}</span>
                    <span>{formatCurrency(currentPlan.max_amount)}</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="duration">Durée (mois)</Label>
                  <div className="mb-2 font-bold text-xl text-center">{duration} mois</div>
                  <Slider
                    value={[duration]}
                    min={currentPlan.min_duration}
                    max={currentPlan.max_duration}
                    step={1}
                    onValueChange={(values) => setDuration(values[0])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{currentPlan.min_duration} mois</span>
                    <span>{currentPlan.max_duration} mois</span>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Mensualité estimée:</span>
                    <span className="font-bold">{formatCurrency(calculateMonthlyPayment())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Montant total à rembourser:</span>
                    <span className="font-medium">{formatCurrency(calculateMonthlyPayment() * duration)}</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="purpose">Objet du prêt</Label>
                  <Select value={purpose} onValueChange={setPurpose} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'objet du prêt" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Activité commerciale</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="education">Éducation</SelectItem>
                      <SelectItem value="housing">Logement</SelectItem>
                      <SelectItem value="personal">Besoins personnels</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="additionalInfo">Informations complémentaires</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Détails supplémentaires sur votre projet..."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={!currentPlan || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Soumission en cours...
                </>
              ) : (
                'Soumettre ma demande'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoanApplicationForm;

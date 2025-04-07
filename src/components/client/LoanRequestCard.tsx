
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/AuthContext';
import { sfdLoanApi } from '@/utils/sfdLoanApi';

export function LoanRequestCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loanAmount, setLoanAmount] = useState(250000);
  const [duration, setDuration] = useState(12);
  const [purpose, setPurpose] = useState<string>('');
  
  // Calculate monthly payment based on loan amount, duration, and a fixed interest rate of 5.5%
  const calculateMonthlyPayment = () => {
    const interestRate = 5.5;
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / (Math.pow(1 + monthlyRate, duration) - 1);
    return isFinite(monthlyPayment) ? Math.round(monthlyPayment) : 0;
  };
  
  // Calculate total repayment amount
  const totalRepayment = calculateMonthlyPayment() * duration;
  
  // Handle loan request submission
  const handleRequestLoan = async () => {
    if (!purpose) {
      toast({
        title: "Champ requis",
        description: "Veuillez sélectionner l'objet du prêt",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      if (!user?.id) {
        throw new Error("Utilisateur non connecté");
      }
      
      // Get the user's active SFD ID
      const activeSfdId = "sfd1"; // In a real app, get this from user context or state
      
      const loanData = {
        client_id: user.id,
        sfd_id: activeSfdId,
        amount: loanAmount,
        duration_months: duration,
        interest_rate: 5.5,
        purpose: purpose,
        monthly_payment: calculateMonthlyPayment(),
      };
      
      await sfdLoanApi.createLoan(loanData);
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été envoyée avec succès",
      });
      
      // Reset form
      setPurpose('');
    } catch (error) {
      console.error('Error requesting loan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande de prêt",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demander un prêt</CardTitle>
        <CardDescription>
          Simulez et demandez un prêt en quelques étapes simples
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Montant du prêt</span>
            <span className="text-sm font-bold">{loanAmount.toLocaleString()} FCFA</span>
          </div>
          <Slider
            value={[loanAmount]}
            min={50000}
            max={5000000}
            step={50000}
            onValueChange={(values) => setLoanAmount(values[0])}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>50,000 FCFA</span>
            <span>5,000,000 FCFA</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Durée du prêt</span>
            <span className="text-sm font-bold">{duration} mois</span>
          </div>
          <Select
            value={duration.toString()}
            onValueChange={(value) => setDuration(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une durée" />
            </SelectTrigger>
            <SelectContent>
              {[3, 6, 12, 18, 24, 36].map((months) => (
                <SelectItem key={months} value={months.toString()}>
                  {months} mois
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <span className="text-sm font-medium">Objet du prêt</span>
          <Select
            value={purpose}
            onValueChange={(value) => setPurpose(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez l'objet du prêt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Commerce">Commerce</SelectItem>
              <SelectItem value="Agriculture">Agriculture</SelectItem>
              <SelectItem value="Éducation">Éducation</SelectItem>
              <SelectItem value="Construction">Construction</SelectItem>
              <SelectItem value="Fonds de roulement">Fonds de roulement</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm">Taux d'intérêt</span>
            <span className="font-medium">5.5%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Mensualité estimée</span>
            <span className="font-medium">{calculateMonthlyPayment().toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-sm font-medium">Coût total du crédit</span>
            <span className="font-bold">{totalRepayment.toLocaleString()} FCFA</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleRequestLoan}
          disabled={loading || !purpose}
        >
          {loading ? 'Traitement...' : 'Demander ce prêt'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default LoanRequestCard;

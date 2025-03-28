
import React, { useState } from 'react';
import { ArrowLeft, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoanAgreementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [otpCode, setOtpCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get loan details from location state
  const loanDetails = location.state || {
    loanId: 'unknown',
    loanAmount: 100000,
    loanDuration: 6,
    monthlyPayment: 17500,
    totalRepayment: 105000,
    interestRate: 5.5
  };
  
  const confirmLoanAgreement = async () => {
    if (!acceptedTerms) {
      toast({
        title: "Acceptation requise",
        description: "Veuillez accepter les termes et conditions du prêt",
        variant: "destructive",
      });
      return;
    }
    
    if (!otpCode || otpCode.length < 4) {
      toast({
        title: "Code OTP requis",
        description: "Veuillez entrer le code OTP reçu par SMS",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate OTP verification
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Demande confirmée",
        description: "Votre accord de prêt a été confirmé avec succès",
        variant: "default",
      });
      
      // Navigate to loan activity page
      navigate('/mobile-flow/loan-activity');
    } catch (error) {
      toast({
        title: "Erreur de confirmation",
        description: "Une erreur est survenue lors de la confirmation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4" 
        onClick={() => navigate('/mobile-flow')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Accord de Prêt</CardTitle>
          <CardDescription>
            Veuillez vérifier et confirmer les détails de votre prêt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-4 border-2 border-dashed rounded-md">
            <FileText className="h-12 w-12 text-[#0D6A51] mr-3" />
            <div>
              <h3 className="font-medium">Contrat de Prêt</h3>
              <p className="text-sm text-muted-foreground">Numéro: {loanDetails.loanId.substring(0, 8)}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-muted rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Montant du prêt</span>
                <span className="font-medium">{loanDetails.loanAmount.toLocaleString()} FCFA</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Durée</span>
                <span className="font-medium">{loanDetails.loanDuration} mois</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Taux d'intérêt</span>
                <span className="font-medium">{loanDetails.interestRate}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Paiement mensuel</span>
                <span className="font-medium">{loanDetails.monthlyPayment.toLocaleString()} FCFA</span>
              </div>
              
              <div className="flex justify-between items-center font-semibold">
                <span className="text-sm">Remboursement total</span>
                <span className="font-medium">{loanDetails.totalRepayment.toLocaleString()} FCFA</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="terms" 
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <Label 
                  htmlFor="terms" 
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  J'ai lu et j'accepte les conditions générales du prêt, y compris les frais, les modalités de remboursement et les pénalités de retard applicables.
                </Label>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="otp">Code de Vérification (OTP)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Un code de vérification a été envoyé au numéro de téléphone associé à votre compte
                </p>
                <Input 
                  id="otp"
                  type="text"
                  placeholder="Entrez le code OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-[#0D6A51] hover:bg-[#0A5A45]"
            onClick={confirmLoanAgreement}
            disabled={isSubmitting || !acceptedTerms}
          >
            {isSubmitting ? "Confirmation en cours..." : "Confirmer l'accord de prêt"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

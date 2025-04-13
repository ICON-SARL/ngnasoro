import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Info, Calendar, ChevronDown, ExternalLink, CheckCircle, Shield, Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { useAuth } from '@/hooks/useAuth';
import { useLocalization } from '@/contexts/LocalizationContext';

const LoanAgreementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  const { language } = useLocalization();
  const { createLoan } = useSfdLoans();
  
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [showTerms, setShowTerms] = useState(false);
  
  // Get loan data from location state or use defaults
  const loanData = location.state?.loanData || {
    amount: 250000,
    duration: 12,
    purpose: 'commerce',
    totalRepayment: 263750,
    monthlyPayment: 21980,
    interestRate: 5.5
  };
  
  // Voice assistant messages
  const voiceMessage = language === 'bambara' 
    ? "I ni ce. I ka juru daani kunnafoni filɛ nin ye. I ka juru daani sugandi, bonya ani waati. I ka OTP wɛrɛ don walasa ka i ka juru daani kɛ. Juru daani waati man jan."
    : "Bienvenue dans la confirmation de prêt. Veuillez vérifier les détails de votre demande et entrer le code OTP reçu par SMS pour confirmer votre prêt. L'approbation sera traitée rapidement.";

  useEffect(() => {
    // Countdown timer for OTP expiration
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const goBack = () => {
    navigate('/mobile-flow');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpCode.length < 4) {
      toast({
        title: "Code incomplet",
        description: "Veuillez entrer un code OTP valide",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create loan in database if we have user and SFD
      if (user?.id && activeSfdId) {
        await createLoan.mutateAsync({
          client_id: user.id, // In a real app, you'd use the actual client_id
          sfd_id: activeSfdId,
          amount: loanData.amount,
          duration_months: loanData.duration,
          interest_rate: loanData.interestRate,
          purpose: loanData.purpose,
          monthly_payment: loanData.monthlyPayment,
          subsidy_amount: 0, // No subsidy in this example
          subsidy_rate: 0
        });
        
        toast({
          title: "Confirmation réussie",
          description: "Votre prêt a été approuvé et sera déboursé sous peu",
        });
        navigate('/mobile-flow/loan-disbursement', { state: { loanData } });
      } else {
        // Demo mode - just simulate success
        setTimeout(() => {
          toast({
            title: "Confirmation réussie",
            description: "Votre prêt a été approuvé et sera déboursé sous peu",
          });
          navigate('/mobile-flow/loan-disbursement', { state: { loanData } });
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating loan:", error);
      toast({
        title: "Erreur de confirmation",
        description: "Une erreur est survenue lors de la confirmation du prêt",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOTP = () => {
    setCountdown(600); // Reset countdown to 10 minutes
    toast({
      title: "Code renvoyé",
      description: "Un nouveau code a été envoyé à votre numéro de téléphone",
    });
  };

  // Calculate payment dates
  const getPaymentDate = (monthsFromNow: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsFromNow);
    return `15/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-5 px-4 rounded-b-3xl shadow-md">
        <div className="flex items-center mb-2">
          <Button variant="ghost" className="p-1 mr-2 text-white" onClick={goBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Accord de Prêt</h1>
        </div>
        <div className="flex flex-col items-center mt-4">
          <div className="w-full h-2 bg-white/30 rounded-full mb-1">
            <div className="h-2 bg-white rounded-full w-full"></div>
          </div>
          <div className="flex justify-between w-full">
            <p className="text-sm">Étape finale</p>
            <p className="text-sm font-medium">Étape 7 sur 7</p>
          </div>
        </div>
        
        {/* Header card showing approved amount */}
        <div className="mt-4 mb-2">
          <h2 className="text-xl font-semibold">Montant approuvé jusqu'à</h2>
          <div className="flex items-baseline">
            <span className="text-5xl font-bold">{loanData.amount.toLocaleString()}</span>
            <span className="text-xl ml-1">FCFA</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 -mt-6">
        <div className="mb-6">
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">SFD Partenaire</h3>
                <Badge className="bg-[#0D6A51]/10 text-[#0D6A51] text-xs">Nyèsigiso</Badge>
              </div>
              
              <div className="space-y-6">
                {/* Loan amount section with slider-like appearance */}
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Montant du prêt</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-semibold text-gray-800">{loanData.amount.toLocaleString()} FCFA</p>
                    <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-blue-200 rounded-full mt-3">
                    <div className="h-2 bg-blue-500 rounded-full w-4/5"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>100.000</span>
                    <span>200.000</span>
                    <span>300.000</span>
                    <span>400.000</span>
                    <span>500.000</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Durée du prêt</p>
                    <p className="text-xl font-semibold text-gray-800">{loanData.duration} mois</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-3.5 w-3.5 text-blue-500 mr-1" />
                      <span className="text-xs text-blue-500">Mensualités fixes</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">À rembourser</p>
                    <p className="text-xl font-semibold text-gray-800">{loanData.totalRepayment.toLocaleString()} FCFA</p>
                    <div className="flex items-center mt-1">
                      <Info className="h-3.5 w-3.5 text-amber-500 mr-1" />
                      <span className="text-xs text-amber-500">Taux: {loanData.interestRate}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <p className="text-gray-600">Première échéance</p>
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">{getPaymentDate(1)}</span>
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <p className="text-gray-600">Mensualité</p>
                    <span className="font-semibold">{loanData.monthlyPayment.toLocaleString()} FCFA</span>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full flex items-center justify-between text-blue-600 py-2 border border-blue-100 rounded-xl"
                    onClick={() => setShowTerms(!showTerms)}
                  >
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Calendrier de paiement
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                
                {showTerms && (
                  <div className="bg-gray-50 p-3 rounded-xl space-y-2 animate-in fade-in-50 duration-300">
                    <h4 className="font-medium text-gray-700">Échéancier de remboursement</h4>
                    {[1, 2, 3].map((month) => (
                      <div key={month} className="flex justify-between py-2 border-b border-dashed border-gray-200">
                        <span className="text-sm">Échéance {month}</span>
                        <span className="text-sm font-medium">{loanData.monthlyPayment.toLocaleString()} FCFA</span>
                        <span className="text-xs text-gray-500">{getPaymentDate(month)}</span>
                      </div>
                    ))}
                    <div className="text-center">
                      <Button variant="link" size="sm" className="text-blue-500">
                        Voir tout l'échéancier
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center bg-green-50 p-3 rounded-xl">
                  <Shield className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Protection Assurance</h4>
                    <p className="text-xs text-green-600">Votre prêt est couvert par une assurance incluse</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <p className="text-sm mb-3">
            Veuillez lire les 
            <Button variant="link" className="text-blue-600 px-1 py-0 h-auto">
              conditions générales du prêt
            </Button>
            avant de confirmer.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-xl mb-5 flex items-start">
            <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm text-blue-700">
                Un code de confirmation valable pour <span className="font-bold">{formatTime(countdown)}</span> a été envoyé à votre numéro de téléphone.
              </p>
              {countdown < 300 && (
                <p className="text-xs text-orange-500 flex items-center">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                  {countdown < 60 ? "Code expirant bientôt!" : "Moins de 5 minutes restantes"}
                </p>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <label className="text-sm font-medium block mb-2">
              Entrez le code de confirmation
            </label>
            <div className="flex gap-4">
              <Input
                type="text"
                maxLength={6}
                placeholder="XXXXXX"
                className="text-center text-lg"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
              <Button 
                type="button" 
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={resendOTP}
              >
                RENVOYER
              </Button>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-bold text-lg mt-6 flex items-center justify-center"
              disabled={isSubmitting || otpCode.length < 4}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Confirmation en cours...</span>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  CONFIRMER LE PRÊT
                </>
              )}
            </Button>
          </form>
        </div>
        
        {/* Fixed bottom card */}
        <div className="fixed bottom-20 inset-x-0 px-4">
          <Card className="border-0 shadow-lg bg-white rounded-xl p-3">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium">Accès instantané</h3>
                <p className="text-xs text-gray-500">Fonds disponibles dans les 24h</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Voice assistant */}
      <div className="fixed bottom-24 right-4 z-50">
        <VoiceAssistant 
          message={voiceMessage}
          autoPlay={true}
          language={language === 'bambara' ? 'bambara' : 'french'}
        />
      </div>
    </div>
  );
};

export default LoanAgreementPage;

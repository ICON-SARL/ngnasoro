import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Info, Calendar, ChevronDown, CheckCircle, Shield, Clock, CreditCard, AlertTriangle } from 'lucide-react';
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
  const { language, t } = useLocalization();
  const { createLoan } = useSfdLoans();
  
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [showTerms, setShowTerms] = useState(false);
  
  const loanData = location.state?.loanData || {
    amount: 250000,
    duration: 12,
    purpose: 'commerce',
    totalRepayment: 263750,
    monthlyPayment: 21980,
    interestRate: 5.5
  };
  
  const voiceMessage = language === 'bambara' 
    ? "I ni ce. I ka juru daani kunnafoni filɛ nin ye. I ka juru daani sugandi, bonya ani waati. I ka OTP wɛrɛ don walasa ka i ka juru daani kɛ. Juru daani waati man jan."
    : "Bienvenue dans la confirmation de prêt. Veuillez vérifier les détails de votre demande et entrer le code OTP reçu par SMS pour confirmer votre prêt. L'approbation sera traitée rapidement.";

  useEffect(() => {
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
        title: language === 'bambara' ? "Tɛmɛsira ma dafa" : "Code incomplet",
        description: language === 'bambara' ? "I ka OTP tɛmɛsira dafalen don" : "Veuillez entrer un code OTP valide",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (user?.id && activeSfdId) {
        await createLoan.mutateAsync({
          client_id: user.id,
          sfd_id: activeSfdId,
          amount: loanData.amount,
          duration_months: loanData.duration,
          interest_rate: loanData.interestRate,
          purpose: loanData.purpose,
          monthly_payment: loanData.monthlyPayment,
          subsidy_amount: 0,
          subsidy_rate: 0
        });
        
        toast({
          title: language === 'bambara' ? "Daaniyali kɛra" : "Confirmation réussie",
          description: language === 'bambara' ? "I ka juru daaniyara ani a bɛ di joona" : "Votre prêt a été approuvé et sera déboursé sous peu",
        });
        navigate('/mobile-flow/loan-disbursement', { state: { loanData } });
      } else {
        setTimeout(() => {
          toast({
            title: language === 'bambara' ? "Daaniyali kɛra" : "Confirmation réussie",
            description: language === 'bambara' ? "I ka juru daaniyara ani a bɛ di joona" : "Votre prêt a été approuvé et sera déboursé sous peu",
          });
          navigate('/mobile-flow/loan-disbursement', { state: { loanData } });
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating loan:", error);
      toast({
        title: language === 'bambara' ? "Daaniyali fili" : "Erreur de confirmation",
        description: language === 'bambara' ? "Fili dɔ kɛra juru daaniyali la" : "Une erreur est survenue lors de la confirmation du prêt",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOTP = () => {
    setCountdown(600);
    toast({
      title: language === 'bambara' ? "Tɛmɛsira ci kokura" : "Code renvoyé",
      description: language === 'bambara' ? "Tɛmɛsira kura cila i ka telefɔnni nɔmɔrɔ la" : "Un nouveau code a été envoyé à votre numéro de téléphone",
    });
  };

  const getPaymentDate = (monthsFromNow: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsFromNow);
    return `15/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-5 px-4 rounded-b-3xl shadow-md">
        <div className="flex items-center mb-2">
          <Button variant="ghost" className="p-1 mr-2 text-white" onClick={goBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">
            {language === 'bambara' ? 'Juru bɛnkansɛbɛn' : 'Accord de Prêt'}
          </h1>
        </div>
        <div className="flex flex-col items-center mt-4">
          <div className="w-full h-2 bg-white/30 rounded-full mb-1">
            <div className="h-2 bg-white rounded-full w-full"></div>
          </div>
          <div className="flex justify-between w-full">
            <p className="text-sm">
              {language === 'bambara' ? 'A laban' : 'Étape finale'}
            </p>
            <p className="text-sm font-medium">
              {language === 'bambara' ? 'Taasira 7 ka bɔ 7 la' : 'Étape 7 sur 7'}
            </p>
          </div>
        </div>
        
        <div className="mt-4 mb-2">
          <h2 className="text-xl font-semibold">
            {language === 'bambara' ? 'Juru hakɛ fo' : 'Montant approuvé jusqu\'à'}
          </h2>
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
                <h3 className="text-lg font-semibold">
                  {language === 'bambara' ? 'SFD Jɛɲɔgɔn' : 'SFD Partenaire'}
                </h3>
                <Badge className="bg-[#0D6A51]/10 text-[#0D6A51] text-xs">Nyèsigiso</Badge>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'bambara' ? 'Juru hakɛ' : 'Montant du prêt'}
                  </p>
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
                    <p className="text-sm text-gray-600 mb-1">
                      {language === 'bambara' ? 'Juru waati' : 'Durée du prêt'}
                    </p>
                    <p className="text-xl font-semibold text-gray-800">
                      {loanData.duration} {language === 'bambara' ? 'kalo' : 'mois'}
                    </p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-3.5 w-3.5 text-blue-500 mr-1" />
                      <span className="text-xs text-blue-500">
                        {language === 'bambara' ? 'Kalo o kalo sara kelen' : 'Mensualités fixes'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">
                      {language === 'bambara' ? 'Ka sara' : 'À rembourser'}
                    </p>
                    <p className="text-xl font-semibold text-gray-800">{loanData.totalRepayment.toLocaleString()} FCFA</p>
                    <div className="flex items-center mt-1">
                      <Info className="h-3.5 w-3.5 text-amber-500 mr-1" />
                      <span className="text-xs text-amber-500">
                        {language === 'bambara' 
                          ? `Nafa: ${loanData.interestRate}%` 
                          : `Taux: ${loanData.interestRate}%`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <p className="text-gray-600">
                      {language === 'bambara' ? 'Sara fɔlɔ' : 'Première échéance'}
                    </p>
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">{getPaymentDate(1)}</span>
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <p className="text-gray-600">
                      {language === 'bambara' ? 'Kalo sara' : 'Mensualité'}
                    </p>
                    <span className="font-semibold">{loanData.monthlyPayment.toLocaleString()} FCFA</span>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full flex items-center justify-between text-blue-600 py-2 border border-blue-100 rounded-xl"
                    onClick={() => setShowTerms(!showTerms)}
                  >
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {language === 'bambara' ? 'Sara waatiw' : 'Calendrier de paiement'}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                
                {showTerms && (
                  <div className="bg-gray-50 p-3 rounded-xl space-y-2 animate-in fade-in-50 duration-300">
                    <h4 className="font-medium text-gray-700">
                      {language === 'bambara' ? 'Sara waatiw kafolen' : 'Échéancier de remboursement'}
                    </h4>
                    {[1, 2, 3].map((month) => (
                      <div key={month} className="flex justify-between py-2 border-b border-dashed border-gray-200">
                        <span className="text-sm">
                          {language === 'bambara' ? `Sara ${month}` : `Échéance ${month}`}
                        </span>
                        <span className="text-sm font-medium">{loanData.monthlyPayment.toLocaleString()} FCFA</span>
                        <span className="text-xs text-gray-500">{getPaymentDate(month)}</span>
                      </div>
                    ))}
                    <div className="text-center">
                      <Button variant="link" size="sm" className="text-blue-500">
                        {language === 'bambara' ? 'Sara waatiw bɛɛ yira' : 'Voir tout l\'échéancier'}
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center bg-green-50 p-3 rounded-xl">
                  <Shield className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">
                      {language === 'bambara' ? 'Lakanali' : 'Protection Assurance'}
                    </h4>
                    <p className="text-xs text-green-600">
                      {language === 'bambara' 
                        ? 'I ka juru lakanalen don ni lakanali ye' 
                        : 'Votre prêt est couvert par une assurance incluse'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <p className="text-sm mb-3">
            {language === 'bambara' ? 'I ka juru sariyaw kalan' : 'Veuillez lire les'}
            <Button variant="link" className="text-blue-600 px-1 py-0 h-auto">
              {language === 'bambara' ? 'juru sariyaw' : 'conditions générales du prêt'}
            </Button>
            {language === 'bambara' ? 'sani i ka a daani' : 'avant de confirmer.'}
          </p>
          
          <div className="bg-blue-50 p-4 rounded-xl mb-5 flex items-start">
            <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm text-blue-700">
                {language === 'bambara' 
                  ? `Daani tɛmɛsira min bɛ se ka baara kɛ ka se `
                  : 'Un code de confirmation valable pour '}
                <span className="font-bold">{formatTime(countdown)}</span>
                {language === 'bambara' 
                  ? ` cila i ka telefɔnni nɔmɔrɔ la.`
                  : ' a été envoyé à votre numéro de téléphone.'}
              </p>
              {countdown < 300 && (
                <p className="text-xs text-orange-500 flex items-center">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                  {countdown < 60 
                    ? (language === 'bambara' ? "Tɛmɛsira bɛna ban joona!" : "Code expirant bientôt!")
                    : (language === 'bambara' ? "Miniti 5 belen bɛ" : "Moins de 5 minutes restantes")}
                </p>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <label className="text-sm font-medium block mb-2">
              {language === 'bambara' ? 'Daani tɛmɛsira sɛbɛn' : 'Entrez le code de confirmation'}
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
                {language === 'bambara' ? 'CI KOKURA' : 'RENVOYER'}
              </Button>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-bold text-lg mt-6 flex items-center justify-center"
              disabled={isSubmitting || otpCode.length < 4}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">
                    {language === 'bambara' ? 'Daaniyali bɛ kɛla...' : 'Confirmation en cours...'}
                  </span>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {language === 'bambara' ? 'I KA JURU DAANI' : 'CONFIRMER LE PRÊT'}
                </>
              )}
            </Button>
          </form>
        </div>
        
        <div className="fixed bottom-20 inset-x-0 px-4">
          <Card className="border-0 shadow-lg bg-white rounded-xl p-3">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium">
                  {language === 'bambara' ? 'Joona don' : 'Accès instantané'}
                </h3>
                <p className="text-xs text-gray-500">
                  {language === 'bambara' ? 'Wari bɛ se ka kɛ i bolo lɛrɛ 24 kɔnɔ' : 'Fonds disponibles dans les 24h'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
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

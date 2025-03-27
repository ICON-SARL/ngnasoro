
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Bank, Calendar, CreditCard, DownloadCloud, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useLocalization } from '@/contexts/LocalizationContext';

const LoanDisbursementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { language } = useLocalization();
  const [animationComplete, setAnimationComplete] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  
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
    ? "I ni ce, i ka juru daani bonya ye. I ka juru kɛra. Wari bɛna don i ka konto kɔnɔ o ye lɛrɛ 24 kɔnɔ. I bɛna dɛmɛni don ka i ka koɲɛ kɛ."
    : "Félicitations, votre prêt a été approuvé. Les fonds seront déposés sur votre compte dans les 24 heures. Vous recevrez une notification dès que le transfert sera effectué.";

  useEffect(() => {
    // Animate loading progress
    const interval = setInterval(() => {
      if (progressValue < 100) {
        setProgressValue(prev => {
          const newValue = prev + 1;
          if (newValue >= 100) {
            setAnimationComplete(true);
            clearInterval(interval);
          }
          return newValue;
        });
      }
    }, 30);
    
    return () => clearInterval(interval);
  }, [progressValue]);

  const goBack = () => {
    navigate(-1);
  };
  
  const goHome = () => {
    navigate('/mobile-flow');
    toast({
      title: "Navigation terminée",
      description: "Vous avez été redirigé vers la page d'accueil"
    });
  };
  
  const shareContract = () => {
    toast({
      title: "Contrat partagé",
      description: "Le contrat a été envoyé à votre adresse email"
    });
  };
  
  const downloadContract = () => {
    toast({
      title: "Téléchargement",
      description: "Le contrat a été téléchargé sur votre appareil"
    });
  };

  // Calculate first payment date
  const getFirstPaymentDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-5 px-4 rounded-b-3xl shadow-md">
        <div className="flex items-center mb-2">
          <Button variant="ghost" className="p-1 mr-2 text-white" onClick={goBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Prêt approuvé</h1>
        </div>
        
        {/* Animation showing completed progress */}
        <div className="flex flex-col items-center mt-8 mb-4">
          <div className="relative w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className={`h-16 w-16 ${animationComplete ? 'text-white' : 'text-white/50'} transition-all duration-500`} />
            </div>
            {!animationComplete && (
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-white/20 stroke-current"
                  strokeWidth="8"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                />
                <circle
                  className="text-white stroke-current"
                  strokeWidth="8"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * progressValue) / 100}
                />
              </svg>
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">{animationComplete ? "Prêt approuvé!" : "En cours..."}</h2>
          <p className="text-center text-white/80 max-w-xs">
            {animationComplete 
              ? "Votre prêt a été approuvé et sera déboursé sous peu." 
              : "Traitement de votre demande en cours..."}
          </p>
        </div>
      </div>

      <div className="px-4 py-6 -mt-6">
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white mb-6">
          <CardContent className="p-5">
            <div className="flex flex-col items-center border-b pb-4 mb-4">
              <div className="text-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">Montant approuvé</h3>
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-bold mr-1">{loanData.amount.toLocaleString()}</span>
                  <span className="text-gray-500">FCFA</span>
                </div>
              </div>
              
              {/* Colorful progress bar */}
              {!animationComplete && (
                <div className="w-full mt-2">
                  <Progress value={progressValue} className="h-2" />
                  <div className="text-center text-xs text-gray-500 mt-1">
                    {progressValue}% traité
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Bank className="h-5 w-5 text-blue-500 mr-2" />
                  <p className="text-gray-600">Compte de réception</p>
                </div>
                <span className="font-medium">**** 7890</span>
              </div>
              
              <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-gray-600">Date de déboursement</p>
                </div>
                <span className="font-medium">Aujourd'hui</span>
              </div>
              
              <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-amber-500 mr-2" />
                  <p className="text-gray-600">Premier paiement</p>
                </div>
                <span className="font-medium">{getFirstPaymentDate()}</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                onClick={downloadContract}
              >
                <DownloadCloud className="h-4 w-4 mr-2" />
                Télécharger le contrat
              </Button>
              
              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
                onClick={shareContract}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager par email
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-blue-50 p-4 rounded-xl mb-6">
          <h4 className="font-medium text-blue-700 mb-2">Prochaines étapes</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-600">
            <li>Fonds disponibles dans 24h</li>
            <li>Notification par SMS de déboursement</li>
            <li>Premier remboursement le {getFirstPaymentDate()}</li>
            <li>Vous pouvez consulter votre prêt à tout moment</li>
          </ol>
        </div>
        
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-bold text-lg"
          onClick={goHome}
        >
          Retourner à l'accueil
        </Button>
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

export default LoanDisbursementPage;

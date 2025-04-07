
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Landmark, Calendar, CreditCard, DownloadCloud, Share2 } from 'lucide-react';
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
  const { language, t } = useLocalization();
  const [animationComplete, setAnimationComplete] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  
  // Obtenir les données du prêt à partir de l'état de localisation ou utiliser des valeurs par défaut
  const loanData = location.state?.loanData || {
    amount: 250000,
    duration: 12,
    purpose: 'commerce',
    totalRepayment: 263750,
    monthlyPayment: 21980,
    interestRate: 5.5
  };
  
  // Messages d'assistance vocale
  const voiceMessage = language === 'bambara' 
    ? "I ni ce, i ka juru daani bonya ye. I ka juru kɛra. Wari bɛna don i ka konto kɔnɔ o ye lɛrɛ 24 kɔnɔ. I bɛna dɛmɛni don ka i ka koɲɛ kɛ."
    : "Félicitations, votre prêt a été approuvé. Les fonds seront déposés sur votre compte dans les 24 heures. Vous recevrez une notification dès que le transfert sera effectué.";

  useEffect(() => {
    // Animer la progression du chargement
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
    navigate('/mobile-flow/main');
    toast({
      title: language === 'bambara' ? "Taamaséré bannta" : "Navigation terminée",
      description: language === 'bambara' ? "I táara so nabilaw ma" : "Vous avez été redirigé vers la page d'accueil"
    });
  };
  
  const shareContract = () => {
    toast({
      title: language === 'bambara' ? "Sɛbɛn dilali" : "Contrat partagé",
      description: language === 'bambara' ? "Juru sɛbɛn ci la i ka email kan" : "Le contrat a été envoyé à votre adresse email"
    });
  };
  
  const downloadContract = () => {
    toast({
      title: language === 'bambara' ? "A tajuru" : "Téléchargement",
      description: language === 'bambara' ? "I ka sɛbɛn tajurula i ka téléphone kan" : "Le contrat a été téléchargé sur votre appareil"
    });
  };

  // Calculer la date du premier paiement
  const getFirstPaymentDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* En-tête avec arrière-plan dégradé */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white py-5 px-4 rounded-b-3xl shadow-md">
        <div className="flex items-center mb-2">
          <Button variant="ghost" className="p-1 mr-2 text-white" onClick={goBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">
            {language === 'bambara' ? 'Juru daaniyalen' : 'Prêt approuvé'}
          </h1>
        </div>
        
        {/* Animation montrant la progression terminée */}
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

          <h2 className="text-2xl font-bold mb-2">
            {animationComplete 
              ? (language === 'bambara' ? 'Juru daaniyalen!' : 'Prêt approuvé!')
              : (language === 'bambara' ? 'A bɛ kɛla...' : 'En cours...')}
          </h2>
          <p className="text-center text-white/80 max-w-xs">
            {animationComplete 
              ? (language === 'bambara' 
                 ? 'I ka juru daaniyalen bɛ na di i ma sisan.' 
                 : 'Votre prêt a été approuvé et sera déboursé sous peu.') 
              : (language === 'bambara' 
                 ? 'I ka ɲini sɛgɛsɛgɛli bɛ kɛla...' 
                 : 'Traitement de votre demande en cours...')}
          </p>
        </div>
      </div>

      <div className="px-4 py-6 -mt-6">
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white mb-6">
          <CardContent className="p-5">
            <div className="flex flex-col items-center border-b pb-4 mb-4">
              <div className="text-center mb-2">
                <h3 className="text-sm font-medium text-gray-500">
                  {language === 'bambara' ? 'Juru hakɛ daanitɔ' : 'Montant approuvé'}
                </h3>
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-bold mr-1">{loanData.amount.toLocaleString()}</span>
                  <span className="text-gray-500">FCFA</span>
                </div>
              </div>
              
              {/* Barre de progression colorée */}
              {!animationComplete && (
                <div className="w-full mt-2">
                  <Progress value={progressValue} className="h-2" />
                  <div className="text-center text-xs text-gray-500 mt-1">
                    {progressValue}% {language === 'bambara' ? 'kɛlen' : 'traité'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Landmark className="h-5 w-5 text-blue-500 mr-2" />
                  <p className="text-gray-600">
                    {language === 'bambara' ? 'Wari mina konto' : 'Compte de réception'}
                  </p>
                </div>
                <span className="font-medium">**** 7890</span>
              </div>
              
              <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-gray-600">
                    {language === 'bambara' ? 'Wari di lon' : 'Date de déboursement'}
                  </p>
                </div>
                <span className="font-medium">
                  {language === 'bambara' ? 'Bi' : 'Aujourd\'hui'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-amber-500 mr-2" />
                  <p className="text-gray-600">
                    {language === 'bambara' ? 'Sara fɔlɔ' : 'Premier paiement'}
                  </p>
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
                {language === 'bambara' ? 'Juru sɛbɛn tajuru' : 'Télécharger le contrat'}
              </Button>
              
              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
                onClick={shareContract}
              >
                <Share2 className="h-4 w-4 mr-2" />
                {language === 'bambara' ? 'A tilala email fɛ' : 'Partager par email'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-blue-50 p-4 rounded-xl mb-6">
          <h4 className="font-medium text-blue-700 mb-2">
            {language === 'bambara' ? 'Ko nataw' : 'Prochaines étapes'}
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-600">
            <li>
              {language === 'bambara' 
                ? 'Wari bɛ i bolo lɛrɛ 24 kɔnɔ' 
                : 'Fonds disponibles dans 24h'}
            </li>
            <li>
              {language === 'bambara' 
                ? 'I bɛna sɛbɛnni dɔ sɔrɔ wari di waati la' 
                : 'Notification par SMS de déboursement'}
            </li>
            <li>
              {language === 'bambara' 
                ? `Sara fɔlɔ bɛ kɛ ${getFirstPaymentDate()}` 
                : `Premier remboursement le ${getFirstPaymentDate()}`}
            </li>
            <li>
              {language === 'bambara' 
                ? 'I bɛ se ka i ka juru ɲɛ fɛ tuma bɛɛ' 
                : 'Vous pouvez consulter votre prêt à tout moment'}
            </li>
          </ol>
        </div>
        
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-bold text-lg"
          onClick={goHome}
        >
          {language === 'bambara' ? 'Segin so' : 'Retourner à l\'accueil'}
        </Button>
      </div>
      
      {/* Assistant vocal */}
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

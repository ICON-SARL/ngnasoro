
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Calendar, ExternalLink, Info, Check, Landmark, CreditCard, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { PaymentMethodTabs } from './secure-payment/PaymentMethodTabs';

const LoanDisbursementPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(5);
  const [animateSuccess, setAnimateSuccess] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('sfd');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);

  useEffect(() => {
    // Effet d'animation après chargement
    setTimeout(() => {
      setAnimateSuccess(true);
    }, 500);

    // Compte à rebours
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleBack = () => {
    navigate('/mobile-flow');
  };

  const handleReceiveFunds = () => {
    setShowPaymentOptions(true);
  };

  const handlePayment = () => {
    setPaymentStatus('pending');
    
    // Simulation de paiement
    setTimeout(() => {
      setPaymentStatus('success');
      toast({
        title: "Fonds reçus avec succès",
        description: "Le montant a été crédité sur votre compte",
      });
      
      // Redirection après succès
      setTimeout(() => {
        navigate('/mobile-flow/main');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4">
        <div className="flex items-center mb-2">
          <Button variant="ghost" className="p-1 text-white" onClick={handleBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold ml-2">Déblocage du Prêt</h1>
        </div>
      </div>

      {!showPaymentOptions ? (
        <div className="p-6">
          <div className={`mb-8 flex justify-center transition-all duration-700 ${animateSuccess ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-20 w-20 text-green-500" />
              </div>
              <div className="absolute -top-2 -right-2 bg-green-500 p-1 rounded-full">
                <Check className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Prêt Approuvé !</h2>
            <p className="text-gray-600">
              {countdown > 0 
                ? `Les fonds seront disponibles dans ${countdown} secondes...` 
                : "Les fonds sont disponibles maintenant"}
            </p>
          </div>

          <Card className="border shadow-sm rounded-2xl overflow-hidden bg-white mb-8">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Détails du Prêt</h3>
                <Badge className="bg-[#0D6A51]/10 text-[#0D6A51]">SFD Nyèsigiso</Badge>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border-b border-gray-100">
                  <div>
                    <p className="text-gray-500 text-sm">Référence:</p>
                    <p className="font-semibold">NGS-LN93827</p>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-blue-500" />
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 border-b border-gray-100">
                  <div>
                    <p className="text-gray-500 text-sm">Montant approuvé:</p>
                    <p className="font-semibold">250.000 FCFA</p>
                  </div>
                  <Info className="h-4 w-4 text-blue-500" />
                </div>

                <div className="flex justify-between items-center p-3 border-b border-gray-100">
                  <div>
                    <p className="text-gray-500 text-sm">Montant à rembourser:</p>
                    <p className="font-semibold">263.750 FCFA</p>
                  </div>
                  <Info className="h-4 w-4 text-blue-500" />
                </div>

                <div className="flex justify-between items-center p-3 border-b border-gray-100">
                  <div>
                    <p className="text-gray-500 text-sm">Première échéance:</p>
                    <p className="font-semibold">15.06.2023</p>
                  </div>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-4">
              Les fonds sont maintenant disponibles. Veuillez choisir comment vous souhaitez les recevoir.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card className="border border-blue-100 bg-blue-50/50 hover:bg-blue-50 cursor-pointer">
                <CardContent className="p-3 flex flex-col items-center">
                  <Landmark className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-blue-800">Compte SFD</p>
                  <p className="text-xs text-blue-600">Instantané</p>
                </CardContent>
              </Card>
              
              <Card className="border border-blue-100 bg-blue-50/50 hover:bg-blue-50 cursor-pointer">
                <CardContent className="p-3 flex flex-col items-center">
                  <CreditCard className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-blue-800">Mobile Money</p>
                  <p className="text-xs text-blue-600">15-30 min</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Button 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white py-4 rounded-xl text-lg font-bold"
            onClick={handleReceiveFunds}
            disabled={countdown > 0}
          >
            RECEVOIR LES FONDS
          </Button>
        </div>
      ) : (
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Recevoir les Fonds</h2>
            <p className="text-gray-600 text-sm">
              Choisissez une méthode pour recevoir vos 250.000 FCFA
            </p>
          </div>
          
          <Card className="border shadow-sm rounded-2xl overflow-hidden bg-white mb-6">
            <CardContent className="p-4">
              <PaymentMethodTabs 
                paymentMethod={paymentMethod}
                balanceStatus="sufficient"
                paymentStatus={paymentStatus}
                onPaymentMethodChange={setPaymentMethod}
                handlePayment={handlePayment}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-between gap-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setShowPaymentOptions(false)}
            >
              Retour
            </Button>
            
            <Button 
              className="flex-1 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={handlePayment}
              disabled={paymentStatus === 'pending'}
            >
              {paymentStatus === 'pending' ? (
                <>
                  <span className="mr-2">Traitement...</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : 'Confirmer'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDisbursementPage;

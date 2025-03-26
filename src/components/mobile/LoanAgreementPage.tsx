
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Calendar, ChevronDown, ExternalLink, CheckCircle, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const LoanAgreementPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goBack = () => {
    navigate('/mobile-flow');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'un traitement
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Confirmation réussie",
        description: "Votre prêt a été approuvé et sera déboursé sous peu",
      });
      navigate('/mobile-flow/loan-disbursement');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
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
          <p className="text-sm">Étape finale</p>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="mb-6">
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">SFD Partenaire</h3>
                <Badge className="bg-[#0D6A51]/10 text-[#0D6A51] text-xs">Nyèsigiso</Badge>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Montant du prêt</p>
                    <p className="text-xl font-semibold text-gray-800">250.000 FCFA</p>
                    <div className="flex items-center mt-1">
                      <Info className="h-3.5 w-3.5 text-blue-500 mr-1" />
                      <span className="text-xs text-blue-500">Taux: 5.5%</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">À rembourser</p>
                    <p className="text-xl font-semibold text-gray-800">263.750 FCFA</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-3.5 w-3.5 text-amber-500 mr-1" />
                      <span className="text-xs text-amber-500">12 mois</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <p className="text-gray-600">Première échéance</p>
                    <div className="flex items-center">
                      <span className="font-semibold mr-1">15/06/2023</span>
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border-b border-gray-100">
                    <p className="text-gray-600">Mensualité</p>
                    <span className="font-semibold">21.980 FCFA</span>
                  </div>
                  
                  <Button variant="ghost" className="w-full flex items-center justify-between text-blue-600 py-2 border border-blue-100 rounded-xl">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Calendrier de paiement
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                
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
          
          <div className="bg-blue-50 p-4 rounded-xl mb-5">
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <p className="text-sm text-blue-700">
                Un code de confirmation valable 10 minutes a été envoyé à votre numéro de téléphone.
              </p>
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
                onClick={() => {
                  toast({
                    title: "Code renvoyé",
                    description: "Un nouveau code a été envoyé à votre numéro de téléphone",
                  });
                }}
              >
                RENVOYER
              </Button>
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white py-6 rounded-xl font-bold text-lg mt-6 flex items-center justify-center"
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
      </div>
    </div>
  );
};

export default LoanAgreementPage;

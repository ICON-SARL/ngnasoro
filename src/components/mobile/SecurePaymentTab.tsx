import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, Phone, Check } from 'lucide-react';
import TabHeader from './secure-payment/TabHeader';
import MobileMoneyModal from './loan/MobileMoneyModal';

export interface SecurePaymentTabProps {
  onBack?: () => void;
  isWithdrawal?: boolean;
  loanId?: string;
  onComplete?: () => void;
}

const SecurePaymentTab: React.FC<SecurePaymentTabProps> = ({ 
  onBack, 
  isWithdrawal = false, 
  loanId,
  onComplete
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileMoneyInitiated, setMobileMoneyInitiated] = useState(false);
  
  const amount = isWithdrawal ? 25000 : loanId ? 3500 : 10000;

  const validateRepayment = (amount: number, method: string) => {
    if (!amount || amount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return false;
    }
    
    if (!method) {
      toast({
        title: "Méthode de paiement requise",
        description: "Veuillez sélectionner une méthode de paiement",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handlePayment = async () => {
    setMobileMoneyInitiated(true);
  };

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  return (
    <div className="bg-white h-full pb-24">
      <TabHeader onBack={handleBackAction} isWithdrawal={isWithdrawal} />
      
      {paymentSuccess ? (
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {isWithdrawal ? "Retrait réussi" : "Paiement réussi"}
          </h2>
          <p className="text-gray-600 mb-6">
            {isWithdrawal 
              ? `Votre retrait de ${amount.toLocaleString()} FCFA a été traité avec succès.` 
              : `Votre paiement de ${amount.toLocaleString()} FCFA a été traité avec succès.`
            } Un reçu a été envoyé à votre adresse email.
          </p>
          <div className="w-full bg-gray-100 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Référence:</span>
              <span className="font-medium">REF-23458976</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut:</span>
              <span className="text-green-600 font-medium">Confirmé</span>
            </div>
          </div>
          <Button 
            className="w-full mb-3"
            onClick={onBack}
          >
            {isWithdrawal ? "Retour au tableau de bord" : "Retour aux détails du prêt"}
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => window.print()}
          >
            Télécharger le reçu
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-2">
            <h2 className="font-bold mb-1">
              {isWithdrawal ? "Détails du retrait" : "Détails du paiement"}
            </h2>
            {isWithdrawal ? (
              <>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Compte:</span>
                  <span>SFD Bamako Principal</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Disponible:</span>
                  <span>198 500 FCFA</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Prêt:</span>
                  <span>Microfinance Bamako</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Échéance:</span>
                  <span>10 Juillet 2023</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>{isWithdrawal ? "Montant du retrait:" : "Montant dû:"}</span>
              <span>{amount.toLocaleString()} FCFA</span>
            </div>
          </div>
          
          <Button 
            onClick={handlePayment}
            disabled={paymentStatus === 'pending'}
            className="w-full"
          >
            {paymentStatus === 'pending' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isWithdrawal ? 'Traitement du retrait...' : 'Traitement du paiement...'}
              </>
            ) : (
              <>
                <Phone className="mr-2 h-4 w-4" />
                {isWithdrawal ? 'Retirer via Mobile Money' : 'Payer via Mobile Money'}
              </>
            )}
          </Button>
        </div>
      )}
      
      {mobileMoneyInitiated && (
        <MobileMoneyModal 
          onClose={() => setMobileMoneyInitiated(false)} 
          isWithdrawal={isWithdrawal}
          amount={amount}
          loanId={loanId}
        />
      )}
    </div>
  );
};

export default SecurePaymentTab;

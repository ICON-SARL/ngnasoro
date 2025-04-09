
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface SuccessViewProps {
  isWithdrawal: boolean;
  amount: number;
  onBack: () => void;
}

const SuccessView: React.FC<SuccessViewProps> = ({ isWithdrawal, amount, onBack }) => {
  return (
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
          <span className="font-medium">REF-{Date.now().toString().substring(6)}</span>
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
        {isWithdrawal ? "Retour au tableau de bord" : "Retour aux détails du paiement"}
      </Button>
      <Button 
        variant="outline"
        className="w-full"
        onClick={() => window.print()}
      >
        Télécharger le reçu
      </Button>
    </div>
  );
};

export default SuccessView;

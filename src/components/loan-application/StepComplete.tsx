
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StepCompleteProps {
  loanAmount: string;
}

const StepComplete: React.FC<StepCompleteProps> = ({ loanAmount }) => {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="relative mx-auto">
        <div className="animate-pulse bg-green-100 dark:bg-green-900/20 rounded-full p-6 inline-block mx-auto">
          <CheckCircle2 className="h-20 w-20 text-green-600 dark:text-green-400" />
        </div>
        <div className="absolute top-0 right-0 animate-bounce">
          <div className="bg-yellow-400 rounded-full p-2">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold mb-2">Demande envoyée avec succès!</h3>
        <p className="text-gray-600 mb-4">
          Votre demande de prêt de {parseInt(loanAmount).toLocaleString('fr-FR')} FCFA a été soumise.
          Vous recevrez une notification dans les 48 heures.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-xl text-left">
          <h4 className="font-medium text-blue-700 mb-2">Prochaines étapes</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-600">
            <li>Vérification de votre demande (24-48h)</li>
            <li>Notification par SMS d'approbation</li>
            <li>Signature électronique des documents</li>
            <li>Déblocage des fonds</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default StepComplete;

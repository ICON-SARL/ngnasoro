
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LoanWorkflowDiagram from '@/components/LoanWorkflowDiagram';

interface LoanProcessFlowProps {
  onBack: () => void;
}

const LoanProcessFlow: React.FC<LoanProcessFlowProps> = ({ onBack }) => {
  return (
    <div className="px-4 pb-16">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
          <ArrowLeft className="h-5 w-5 mr-1" /> Retour
        </Button>
        <h1 className="text-xl font-bold ml-2">Processus de Prêt</h1>
      </div>
      
      <div className="prose max-w-full mb-6">
        <p className="text-muted-foreground">
          Ce diagramme illustre le processus complet de demande de prêt, d'approbation, et de décaissement des fonds.
        </p>
      </div>
      
      <LoanWorkflowDiagram />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Informations complémentaires</h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li>• Les demandes de prêt sont généralement traitées en moins de 24 heures</li>
          <li>• Le décaissement des fonds est immédiat après l'approbation</li>
          <li>• Les transferts Mobile Money sont disponibles avec Orange Money, Wave et MTN</li>
          <li>• Pour les retraits en agence, votre QR code reste valide pendant 72 heures</li>
        </ul>
      </div>
    </div>
  );
};

export default LoanProcessFlow;

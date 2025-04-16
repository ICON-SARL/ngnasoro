
import React from 'react';
import { CheckCircle, Circle, ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface LoanProcessDiagramProps {
  currentStage?: 'application' | 'verification' | 'approval' | 'disbursement' | 'completed';
}

const LoanProcessDiagram: React.FC<LoanProcessDiagramProps> = ({ 
  currentStage = 'application' 
}) => {
  const stages = [
    { id: 'application', label: 'Demande', icon: <Circle className="h-5 w-5" /> },
    { id: 'verification', label: 'Vérification', icon: <Circle className="h-5 w-5" /> },
    { id: 'approval', label: 'Approbation', icon: <Circle className="h-5 w-5" /> },
    { id: 'disbursement', label: 'Décaissement', icon: <Circle className="h-5 w-5" /> },
    { id: 'completed', label: 'Terminé', icon: <Circle className="h-5 w-5" /> },
  ];
  
  const stageIndex = stages.findIndex(stage => stage.id === currentStage);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <div className="flex flex-col items-center">
              <div className={`rounded-full p-1 ${
                index < stageIndex ? 'bg-green-100 text-green-600' : 
                index === stageIndex ? 'bg-blue-100 text-blue-600' : 
                'bg-gray-100 text-gray-400'
              }`}>
                {index < stageIndex ? (
                  <CheckCircle className="h-5 w-5" />
                ) : index === stageIndex ? (
                  <Clock className="h-5 w-5" />
                ) : (
                  stage.icon
                )}
              </div>
              <p className={`text-xs mt-1 ${
                index < stageIndex ? 'text-green-600' : 
                index === stageIndex ? 'text-blue-600 font-medium' : 
                'text-gray-400'
              }`}>
                {stage.label}
              </p>
            </div>
            
            {index < stages.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${
                index < stageIndex ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LoanProcessDiagram;

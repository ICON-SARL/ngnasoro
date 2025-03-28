
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm">Étape {currentStep} sur {totalSteps}</div>
        <div className="text-sm font-medium">{Math.round((currentStep / totalSteps) * 100)}%</div>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#0D6A51] rounded-full transition-all duration-300" 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepIndicator;

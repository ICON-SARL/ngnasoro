
import React from 'react';
import { ShoppingBag, BadgeEuro, User, ShieldCheck, Home, Wallet } from 'lucide-react';
import StepStart from './StepStart';
import StepPurpose from './StepPurpose';
import StepAmount from './StepAmount';
import StepDuration from './StepDuration';
import StepLocation from './StepLocation';
import StepReview from './StepReview';
import StepComplete from './StepComplete';
import { LoanApplicationStep, PurposeOption } from './types';

interface LoanStepContentProps {
  currentStep: LoanApplicationStep;
  loanPurpose: string;
  setLoanPurpose: (purpose: string) => void;
  loanAmount: string;
  setLoanAmount: (amount: string) => void;
  loanDuration: string;
  setLoanDuration: (duration: string) => void;
}

const LoanStepContent: React.FC<LoanStepContentProps> = ({
  currentStep,
  loanPurpose,
  setLoanPurpose,
  loanAmount,
  setLoanAmount,
  loanDuration,
  setLoanDuration
}) => {
  const purposeOptions: PurposeOption[] = [
    { id: 'agriculture', name: 'Agriculture', icon: <ShoppingBag className="h-6 w-6 mb-2 text-green-500" />, description: "Financement agricole" },
    { id: 'commerce', name: 'Commerce', icon: <BadgeEuro className="h-6 w-6 mb-2 text-blue-500" />, description: "Développement commercial" },
    { id: 'education', name: 'Éducation', icon: <User className="h-6 w-6 mb-2 text-purple-500" />, description: "Frais de scolarité" },
    { id: 'sante', name: 'Santé', icon: <ShieldCheck className="h-6 w-6 mb-2 text-red-500" />, description: "Dépenses médicales" },
    { id: 'logement', name: 'Logement', icon: <Home className="h-6 w-6 mb-2 text-amber-500" />, description: "Amélioration habitat" },
    { id: 'autre', name: 'Autre', icon: <Wallet className="h-6 w-6 mb-2 text-gray-500" />, description: "Autre besoin" },
  ];

  switch (currentStep) {
    case 'start':
      return <StepStart />;
    
    case 'purpose':
      return (
        <StepPurpose 
          loanPurpose={loanPurpose} 
          setPurpose={setLoanPurpose} 
        />
      );
    
    case 'amount':
      return (
        <StepAmount 
          loanAmount={loanAmount} 
          setAmount={setLoanAmount} 
        />
      );
    
    case 'duration':
      return (
        <StepDuration 
          loanAmount={loanAmount}
          loanDuration={loanDuration} 
          setDuration={setLoanDuration} 
        />
      );
    
    case 'location':
      return <StepLocation />;
    
    case 'review':
      return (
        <StepReview 
          loanPurpose={loanPurpose}
          loanAmount={loanAmount}
          loanDuration={loanDuration}
          purposeOptions={purposeOptions}
        />
      );
    
    case 'complete':
      return <StepComplete loanAmount={loanAmount} />;
    
    default:
      return <StepStart />;
  }
};

export default LoanStepContent;


import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface LoanApplicationHeaderProps {
  onBack: () => void;
}

const LoanApplicationHeader: React.FC<LoanApplicationHeaderProps> = ({ onBack }) => {
  return (
    <Button 
      variant="ghost" 
      className="mb-4 pl-0" 
      onClick={onBack}
    >
      <ArrowLeft className="mr-2 h-5 w-5" /> Retour
    </Button>
  );
};

export default LoanApplicationHeader;

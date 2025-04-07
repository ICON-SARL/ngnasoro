
import React from 'react';
import { Button } from "@/components/ui/button";

interface LoanApplicationFooterProps {
  onRepaymentClick: () => void;
}

const LoanApplicationFooter: React.FC<LoanApplicationFooterProps> = ({ onRepaymentClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex justify-center">
      <Button 
        onClick={onRepaymentClick}
        variant="outline"
        className="text-[#0D6A51] border-[#0D6A51] hover:bg-[#0D6A51]/10"
      >
        Rembours.
      </Button>
    </div>
  );
};

export default LoanApplicationFooter;

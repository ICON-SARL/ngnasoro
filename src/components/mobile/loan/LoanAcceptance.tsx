
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface LoanAcceptanceProps {
  acceptTerms: boolean;
  onAcceptTermsChange: (checked: boolean) => void;
}

const LoanAcceptance = ({ 
  acceptTerms, 
  onAcceptTermsChange 
}: LoanAcceptanceProps) => {
  return (
    <div>
      <div className="mt-4 flex items-start space-x-2">
        <Checkbox 
          id="terms" 
          className="mt-1" 
          checked={acceptTerms}
          onCheckedChange={(checked) => onAcceptTermsChange(checked as boolean)}
        />
        <label htmlFor="terms" className="text-xs text-gray-500">
          I have read and agree to the Terms & Conditions of RupeeRedee
        </label>
      </div>
      
      <Button 
        className={`w-full mt-4 py-6 rounded-xl font-bold text-lg ${acceptTerms ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        disabled={!acceptTerms}
      >
        ACCEPT
      </Button>
    </div>
  );
};

export default LoanAcceptance;

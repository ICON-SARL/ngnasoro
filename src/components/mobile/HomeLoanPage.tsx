
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import HomeLoanHeader from './loan/HomeLoanHeader';
import LoanAmountSelector from './loan/LoanAmountSelector';
import LoanTermSelector from './loan/LoanTermSelector';
import LoanDetailsInfo from './loan/LoanDetailsInfo';
import LoanAcceptance from './loan/LoanAcceptance';
import SpecialOffers from './loan/SpecialOffers';

const HomeLoanPage = () => {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState(3250);
  const [termMonths, setTermMonths] = useState(3);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const viewLoanProcess = () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lovable:action', { 
        detail: { action: 'Loan Process' } 
      });
      window.dispatchEvent(event);
    }
  };

  const handleLoanAmountChange = (value: number[]) => {
    setLoanAmount(value[0]);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="h-full bg-blue-600">
      <HomeLoanHeader onViewLoanProcess={viewLoanProcess} />

      <div className="bg-white rounded-t-3xl px-4 py-6 h-full">
        <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white mb-6">
          <CardContent className="p-4">
            <div>
              <LoanAmountSelector 
                loanAmount={loanAmount} 
                onLoanAmountChange={handleLoanAmountChange} 
                formatCurrency={formatCurrency} 
              />
              
              <LoanTermSelector termMonths={termMonths} />
              
              <LoanDetailsInfo 
                disbursementAmount={4750} 
                repaymentAmount={3950} 
                repaymentDate="20.05.2023" 
                formatCurrency={formatCurrency} 
              />
              
              <LoanAcceptance 
                acceptTerms={acceptTerms} 
                onAcceptTermsChange={(checked) => setAcceptTerms(checked)} 
              />
            </div>
          </CardContent>
        </Card>
        
        <SpecialOffers />
      </div>
    </div>
  );
};

export default HomeLoanPage;

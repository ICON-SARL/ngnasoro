
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Plus, Home, CreditCard, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLoanHeader from './loan/HomeLoanHeader';
import LoanAmountSelector from './loan/LoanAmountSelector';
import LoanAcceptance from './loan/LoanAcceptance';
import { Slider } from '@/components/ui/slider';

const HomeLoanPage = () => {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState(3250);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const viewLoanProcess = () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lovable:action', { 
        detail: { action: 'Loan Process' } 
      });
      window.dispatchEvent(event);
    }
    navigate('/mobile-flow/loan-process');
  };

  const handleLoanAmountChange = (value: number[]) => {
    setLoanAmount(value[0]);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleApplyLoan = () => {
    // Submit loan application
    navigate('/mobile-flow/loan-agreement');
  };

  return (
    <div className="h-full bg-blue-600 pb-20">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/57edf9b1-a247-48e5-bdc0-eeaa3033bfbf.png" 
              alt="RupeeRedee Logo" 
              className="h-8 w-8" 
            />
            <h1 className="text-xl font-bold text-white">RupeeRedee</h1>
          </div>
        </div>
        <Bell className="h-6 w-6 text-white" />
      </div>

      <div className="px-4 pb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Approved limit up to <span>↗</span></h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center text-xs bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white"
            onClick={viewLoanProcess}
          >
            <Plus className="h-3 w-3 mr-1" /> Processus
          </Button>
        </div>
        <h2 className="text-5xl font-bold text-white mb-4">₹5,000</h2>
      </div>

      <div className="bg-white rounded-t-3xl px-4 py-6">
        <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white mb-6">
          <CardContent className="p-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-600">I want money</p>
                <div className="flex items-center">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-4xl font-bold mb-4">{formatCurrency(loanAmount)}</h3>
              
              <div className="mb-4">
                <Slider 
                  value={[loanAmount]} 
                  max={5000} 
                  min={1000} 
                  step={250}
                  onValueChange={handleLoanAmountChange}
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>1000</span>
                <span>2500</span>
                <span>3000</span>
                <span>4000</span>
                <span>5000</span>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
                  onClick={handleApplyLoan}
                >
                  Apply Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeLoanPage;

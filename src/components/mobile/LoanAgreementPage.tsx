
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Calendar, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const LoanAgreementPage = () => {
  const navigate = useNavigate();
  const [otpCode, setOtpCode] = useState('');

  const goBack = () => {
    navigate('/mobile-flow');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implémentation de la soumission du formulaire
  };

  return (
    <div className="h-full bg-blue-600">
      <div className="px-4 py-6">
        <div className="flex items-center mb-2">
          <Button variant="ghost" className="p-1 mr-2 text-white" onClick={goBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-white">Registration</h1>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl p-6 h-full">
        <div className="mb-6">
          <div className="flex flex-col items-center mb-4">
            <h2 className="text-xl font-bold mb-2">Loan Agreement</h2>
            <div className="w-full h-2 bg-green-500 rounded-full mb-1">
              <div className="h-2 bg-green-500 rounded-full w-full"></div>
            </div>
            <p className="text-sm text-gray-500">6 step of 6</p>
          </div>
          
          <h3 className="text-center mb-6 font-medium">
            Lending Partner FinCFriends<br />
            Private Limited
          </h3>
        </div>
        
        <Card className="w-full border shadow-sm rounded-xl overflow-hidden bg-white mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Loan Amount</p>
                <div className="flex items-center">
                  <span className="font-semibold mr-1">Variable</span>
                  <Info className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Amount to be Credited</p>
                <div className="flex items-center">
                  <span className="font-semibold mr-1">₹3,951</span>
                  <Info className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Repayment Amount</p>
                <div className="flex items-center">
                  <span className="font-semibold mr-1">₹5,632</span>
                  <Info className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-gray-600">First Repayment Date</p>
                <div className="flex items-center">
                  <span className="font-semibold mr-1">20.06.2023</span>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              
              <Button variant="ghost" className="flex w-full items-center justify-between text-blue-600 py-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Payment schedule
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mb-6">
          <p className="text-sm mb-2">
            Please read the terms and conditions of the 
            <Button variant="link" className="text-blue-600 px-1 py-0">
              Loan Agreement
            </Button>
            before availing the loan.
          </p>
          
          <div className="mt-4">
            <label className="text-sm font-medium block mb-2">
              Enter 4-digit OTP code
            </label>
            <div className="flex gap-4">
              <Input
                type="text"
                maxLength={6}
                placeholder="XXXXXX"
                className="text-center text-lg"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                GET CODE
              </Button>
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full bg-green-500 hover:bg-green-600 text-white py-6 rounded-xl font-bold text-lg mt-auto"
          onClick={() => navigate('/mobile-flow')}
        >
          CONFIRM FOR DISBURSAL
        </Button>
      </div>
    </div>
  );
};

export default LoanAgreementPage;

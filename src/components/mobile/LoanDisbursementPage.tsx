
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, Info, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const LoanDisbursementPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate('/mobile-flow');
  };

  return (
    <div className="h-full bg-green-500">
      <div className="px-4 py-6">
        <div className="flex items-center mb-2">
          <Button variant="ghost" className="p-1 mr-2 text-white" onClick={goBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-white">Disbursement Process</h1>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl p-6 flex flex-col items-center h-full">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <img 
            src="/lovable-uploads/006177a9-5cd7-4b31-9abb-0760a787e66f.png" 
            alt="Dog Mascot" 
            className="h-20 w-20 object-contain" 
          />
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-center">Loan Approved!</h2>
        <p className="text-gray-600 mb-6 text-center">
          It usually takes no more than 5 minutes
        </p>
        
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
                <p className="text-gray-600">Repayment Date</p>
                <div className="flex items-center">
                  <span className="font-semibold mr-1">20.06.2023</span>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-6">
              Wait, please. As soon as the money is transferred and the 
              contract is activated, we will send you a notification about 
              this. Usually money is transferred instantly, but in rare cases 
              there are delays.
            </p>
            
            <Button 
              variant="outline"
              className="flex items-center justify-center mt-4 w-full border-blue-500 text-blue-600"
            >
              <Camera className="h-4 w-4 mr-2" /> Didn't receive money?
            </Button>
          </CardContent>
        </Card>
        
        <Button 
          className="w-full bg-green-500 hover:bg-green-600 text-white py-6 rounded-xl font-bold text-lg mt-auto"
        >
          ACCEPT
        </Button>
      </div>
    </div>
  );
};

export default LoanDisbursementPage;

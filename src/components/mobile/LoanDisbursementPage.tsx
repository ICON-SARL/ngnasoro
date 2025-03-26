
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Calendar, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LoanDisbursementPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/mobile-flow');
  };

  const handleConfirm = () => {
    navigate('/mobile-flow');
  };

  return (
    <div className="h-full bg-white">
      <div className="bg-blue-600 p-4 text-white">
        <div className="flex items-center mb-2">
          <Button variant="ghost" className="p-1 text-white" onClick={handleBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold ml-2">Disbursement process</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <img 
              src="/lovable-uploads/006177a9-5cd7-4b31-9abb-0760a787e66f.png" 
              alt="Loan Approved" 
              className="h-32 w-32" 
            />
            <div className="absolute -top-2 -right-2 bg-green-100 p-1 rounded-full">
              <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Loan Approved!</h2>
          <p className="text-gray-600">It usually takes no more than 5 minutes</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center p-3 border-b border-gray-100">
            <div>
              <p className="text-gray-500 text-sm">Loan ID:</p>
              <p className="font-semibold">LN9382749</p>
            </div>
            <div className="flex items-center">
              <span className="text-blue-600 text-xs font-medium mr-1">Variable</span>
              <Info className="h-4 w-4 text-blue-500" />
            </div>
          </div>

          <div className="flex justify-between items-center p-3 border-b border-gray-100">
            <div>
              <p className="text-gray-500 text-sm">Amount:</p>
              <p className="font-semibold">₹3,961</p>
            </div>
            <Info className="h-4 w-4 text-blue-500" />
          </div>

          <div className="flex justify-between items-center p-3 border-b border-gray-100">
            <div>
              <p className="text-gray-500 text-sm">Amount to be Credited:</p>
              <p className="font-semibold">₹5,632</p>
            </div>
            <Info className="h-4 w-4 text-blue-500" />
          </div>

          <div className="flex justify-between items-center p-3 border-b border-gray-100">
            <div>
              <p className="text-gray-500 text-sm">Repayment Date:</p>
              <p className="font-semibold">20.05.2023</p>
            </div>
            <Calendar className="h-4 w-4 text-blue-500" />
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs text-gray-500 mb-4">
            Your e-signature will appear on all loan documents. By clicking "CONFIRM" you are digitally signing this loan agreement and authorizing the disbursement of funds.
          </p>
          
          <div className="flex items-center justify-center mb-4">
            <Button variant="outline" className="text-blue-600 border-blue-600 text-sm">
              <ExternalLink className="h-4 w-4 mr-1" /> When will I receive money?
            </Button>
          </div>
        </div>

        <Button 
          className="w-full bg-green-500 hover:bg-green-600 text-white py-6 rounded-full text-lg font-bold"
          onClick={handleConfirm}
        >
          CONFIRM
        </Button>
      </div>
    </div>
  );
};

export default LoanDisbursementPage;

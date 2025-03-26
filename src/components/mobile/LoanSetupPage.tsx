
import React from 'react';
import { ArrowLeft, Building, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LoanSetupPage = () => {
  return (
    <div className="h-full bg-white p-6">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" className="p-0">
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold leading-tight mb-4">
          Unlocking your pay starts now
        </h1>
        <p className="text-gray-600">
          In order to access your earnings, we need to set up your account.
        </p>
      </div>

      <div className="space-y-8 mb-10">
        <div className="flex">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <Building className="h-6 w-6 text-green-800" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              1. Provide your bank, debit card and employer details
            </h2>
          </div>
        </div>

        <div className="flex">
          <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-orange-800" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              2. We'll verify your bank account and employment
            </h2>
          </div>
        </div>

        <div className="flex">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <DollarSign className="h-6 w-6 text-green-800" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              3. Get money in your bank!
            </h2>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-10">
        Restrictions apply, see Earnin Terms of Service for details.
      </div>

      <Button className="w-full bg-green-900 hover:bg-green-800 text-white py-6 text-lg rounded-xl">
        Continue
      </Button>
    </div>
  );
};

export default LoanSetupPage;

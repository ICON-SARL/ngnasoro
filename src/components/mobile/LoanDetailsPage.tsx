
import React from 'react';
import { ArrowLeft, CreditCard, DollarSign, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LoanDetailsPageProps {
  onBack: () => void;
}

const LoanDetailsPage: React.FC<LoanDetailsPageProps> = ({ onBack }) => {
  const loanDetails = {
    type: 'Business Loan',
    amount: 1459.20,
    approvedDate: '02/02/2023',
    nextPayment: '03/02/2023',
    interestRate: '2.5%',
    term: '12 months',
    status: 'Active'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  return (
    <div className="h-full bg-gray-50 p-4">
      <div className="flex items-center mb-6">
        <Button variant="outline" className="rounded-full p-2 mr-4 border-gray-300" onClick={onBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{loanDetails.type}</h1>
      </div>

      <Card className="overflow-hidden border rounded-3xl shadow-sm mb-6">
        <CardContent className="p-5">
          <div className="mb-4">
            <p className="text-gray-500">Current Balance</p>
            <h2 className="text-4xl font-bold">{formatCurrency(loanDetails.amount)}</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-3">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <DollarSign className="h-4 w-4 text-green-800" />
                </div>
                <span className="text-sm">Loan Amount</span>
              </div>
              <p className="text-xl font-bold mt-1">{formatCurrency(loanDetails.amount)}</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-3">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <Calendar className="h-4 w-4 text-green-800" />
                </div>
                <span className="text-sm">Monthly Payment</span>
              </div>
              <p className="text-xl font-bold mt-1">{formatCurrency(loanDetails.amount / 12)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">Loan Details</h2>
      <Card className="overflow-hidden border rounded-3xl shadow-sm mb-6">
        <CardContent className="p-0">
          <div className="divide-y">
            <div className="flex justify-between items-center p-4">
              <span className="text-gray-500">Interest Rate</span>
              <span className="font-semibold">{loanDetails.interestRate}</span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-gray-500">Loan Term</span>
              <span className="font-semibold">{loanDetails.term}</span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-gray-500">Next Payment Date</span>
              <span className="font-semibold">{loanDetails.nextPayment}</span>
            </div>
            <div className="flex justify-between items-center p-4">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-green-600">{loanDetails.status}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card className="overflow-hidden border rounded-xl shadow-sm hover:shadow cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <DollarSign className="h-5 w-5 text-green-800" />
              </div>
              <span className="font-medium">Make a payment</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border rounded-xl shadow-sm hover:shadow cursor-pointer">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Clock className="h-5 w-5 text-blue-800" />
              </div>
              <span className="font-medium">Payment history</span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoanDetailsPage;

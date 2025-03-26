
import React from 'react';
import { ArrowLeft, DollarSign, CreditCard, Calendar, Clock, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface LoanDetailsPageProps {
  onBack: () => void;
}

const LoanDetailsPage: React.FC<LoanDetailsPageProps> = ({ onBack }) => {
  const loanDetails = {
    store: 'Insting Store',
    paid: 10.40,
    remaining: 15.00,
    progress: 40, // percentage of completion
    payments: [
      { id: 1, date: '05 August 2023', amount: 3.50, status: 'paid' },
      { id: 2, date: '05 July 2023', amount: 3.50, status: 'paid' },
      { id: 3, date: '05 June 2023', amount: 3.50, status: 'paid' }
    ]
  };

  return (
    <div className="h-full bg-white">
      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Loan details</h1>
        <Button variant="ghost" className="p-1">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4">
        <h1 className="text-2xl font-bold">Insting Store</h1>
        
        <Tabs defaultValue="tracking" className="mt-4">
          <TabsList className="bg-gray-100 rounded-full p-1 mb-6">
            <TabsTrigger value="tracking" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              Tracking
            </TabsTrigger>
            <TabsTrigger value="details" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              Details
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracking" className="mt-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm text-gray-500">Paid to date</p>
                <p className="text-xl font-bold">${loanDetails.paid}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-xl font-bold">${loanDetails.remaining}</p>
              </div>
            </div>
            
            <div className="relative w-full h-2 bg-gray-100 rounded-full">
              <div 
                className="absolute top-0 left-0 h-2 bg-teal-500 rounded-full" 
                style={{ width: `${loanDetails.progress}%` }}
              ></div>
              <div 
                className="absolute top-0 left-0 h-6 w-6 rounded-full bg-white border-2 border-teal-500 -mt-2 flex items-center justify-center"
                style={{ left: `${loanDetails.progress}%`, marginLeft: '-12px' }}
              >
                <div className="h-3 w-3 rounded-full bg-teal-500"></div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold flex items-center mb-4">
                <Clock className="h-5 w-5 mr-2" /> Processing
              </h3>
              
              {loanDetails.payments.map((payment, index) => (
                <div key={payment.id} className="mb-4 relative pl-6">
                  <div className={`absolute top-1.5 left-0 w-3 h-3 rounded-full ${index === 0 ? 'bg-teal-500' : index === 1 ? 'bg-purple-400' : 'bg-teal-300'}`}></div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Auto pay</p>
                      <p className="text-xs text-gray-500">{payment.date}</p>
                    </div>
                    <p className="font-bold">${payment.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Card className="bg-purple-100 border-0 rounded-xl mt-6">
              <CardContent className="p-4">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <img src="/lovable-uploads/ef525c3f-3c63-46c2-a852-9c93524d29df.png" alt="Processing" className="w-16 h-16" />
                  </div>
                  <div>
                    <h3 className="font-bold">Your loan still processing</h3>
                    <p className="text-sm mt-1">The processing phase is an important step in the loan application process</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="details">
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">Loan Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-bold">${(loanDetails.paid + loanDetails.remaining).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Term</p>
                      <p className="font-bold">6 months</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Interest Rate</p>
                      <p className="font-bold">2.5%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Payment</p>
                      <p className="font-bold">$3.50</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">Purchase Details</h3>
                  <p className="text-sm text-gray-500">Date of Purchase</p>
                  <p className="font-bold mb-2">January 5, 2023</p>
                  
                  <p className="text-sm text-gray-500">Store</p>
                  <p className="font-bold">Insting Store</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoanDetailsPage;

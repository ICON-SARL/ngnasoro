
import React, { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LoanProps {
  id: string;
  type: string;
  amount: number;
  approvedDate: string;
  status: 'Paid' | 'Unpaid' | 'Approved';
  icon?: React.ReactNode;
}

const LoanActivityPage = () => {
  const [loans, setLoans] = useState<LoanProps[]>([
    {
      id: '1',
      type: 'Health Loan',
      amount: 9439.20,
      approvedDate: '02/02/2023',
      status: 'Approved',
      icon: <CreditCard className="h-5 w-5 text-green-800" />
    },
    {
      id: '2',
      type: 'Business Loan',
      amount: 2030.23,
      approvedDate: '02/02/2023',
      status: 'Paid',
      icon: <CreditCard className="h-5 w-5 text-green-800" />
    },
    {
      id: '3',
      type: 'Student Loan',
      amount: 3259.04,
      approvedDate: '02/02/2023',
      status: 'Unpaid',
      icon: <CreditCard className="h-5 w-5 text-green-800" />
    }
  ]);

  return (
    <div className="h-full bg-gray-50 p-4">
      <div className="flex items-center mb-6">
        <Button variant="outline" className="rounded-full p-2 mr-4 border-gray-300" asChild>
          <div>
            <ArrowLeft className="h-6 w-6" />
          </div>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Loan Activity</h1>
      </div>

      <div className="space-y-4">
        {loans.map((loan) => (
          <Card key={loan.id} className="overflow-hidden border rounded-3xl shadow-sm">
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      {loan.icon}
                    </div>
                    <h3 className="text-2xl font-bold tracking-tighter">{loan.type}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-semibold">
                      ${loan.amount.toFixed(2)}
                    </span>
                    <div className="text-sm text-gray-500">
                      Approved {loan.approvedDate}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <Badge 
                    className={`rounded-full px-4 py-1 ${
                      loan.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : loan.status === 'Unpaid' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {loan.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LoanActivityPage;

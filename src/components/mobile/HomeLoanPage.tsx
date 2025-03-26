
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, DollarSign, Wallet, Clock, ArrowRight, User, Bell, ActivitySquare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from '@/hooks/useAccount';

const HomeLoanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { account } = useAccount();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';
  
  const loanCount = 3; // This would be fetched from a real API
  
  const loans = [
    {
      id: 1,
      store: 'Insting Store',
      amount: 25.40,
      progress: 60,
      status: 'Approved'
    },
    {
      id: 2,
      store: 'Home Decoration',
      amount: 15.50,
      progress: 30,
      status: 'Approved'
    },
    {
      id: 3,
      store: 'Sahara Beauty',
      amount: 5.80,
      progress: 20,
      status: 'Approved'
    }
  ];

  const goBack = () => {
    navigate('/mobile-flow');
  };

  const handleLoanDetails = (loanId: number) => {
    navigate('/mobile-flow');
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const viewLoanProcess = () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lovable:action', { 
        detail: { action: 'Loan Process' } 
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="h-full bg-white">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-lime-200 flex items-center justify-center mr-2">
            <span className="text-black font-bold">$</span>
          </div>
          <h1 className="text-xl font-bold">InstingLoan</h1>
        </div>
        <Bell className="h-6 w-6" />
      </div>

      <div className="px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Loans</h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center text-xs"
            onClick={viewLoanProcess}
          >
            <ActivitySquare className="h-3 w-3 mr-1" /> Processus
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 mt-4 bg-lime-200 rounded-3xl mx-4">
        <p className="uppercase text-xs font-semibold">TOTAL BALANCE</p>
        <h2 className="text-4xl font-bold mb-1">$82.50</h2>
        <p className="text-sm">Due this month</p>
        
        <Tabs defaultValue="current" className="mt-6">
          <TabsList className="bg-white rounded-full p-1">
            <TabsTrigger value="current" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <Wallet className="h-4 w-4 mr-2" /> Current loans
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-full px-6 py-2 data-[state=active]:bg-black data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" /> Past loans
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-4 px-4 space-y-4">
        {loans.map((loan) => (
          <Card key={loan.id} className="border shadow-sm rounded-xl overflow-hidden" onClick={() => handleLoanDetails(loan.id)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    {loan.store.includes('Insting') && (
                      <div className="w-6 h-6 bg-lime-200 rounded-md flex items-center justify-center">
                        <span className="text-xs font-bold">$</span>
                      </div>
                    )}
                    {loan.store.includes('Home') && (
                      <div className="w-6 h-6 bg-lime-100 rounded-md flex items-center justify-center">
                        <span className="text-xs font-bold">H</span>
                      </div>
                    )}
                    {loan.store.includes('Sahara') && (
                      <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                        <span className="text-xs font-bold">S</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{loan.store}</p>
                    <p className="text-lg font-bold">${loan.amount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-lime-100 text-green-800">
                    {loan.status}
                  </span>
                </div>
              </div>
              <div className="w-full h-1 bg-gray-100 rounded-full mt-4">
                <div 
                  className="h-1 bg-lime-500 rounded-full" 
                  style={{ width: `${loan.progress}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomeLoanPage;

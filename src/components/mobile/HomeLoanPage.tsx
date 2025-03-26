
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, DollarSign, Wallet, Clock, ArrowRight, User, Bell, ActivitySquare, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from '@/hooks/useAccount';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

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
    return `₹${amount.toFixed(2)}`;
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
    <div className="h-full bg-blue-600">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/006177a9-5cd7-4b31-9abb-0760a787e66f.png" 
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
          <h1 className="text-2xl font-bold text-white">Approved limit up to</h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center text-xs bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white"
            onClick={viewLoanProcess}
          >
            <ActivitySquare className="h-3 w-3 mr-1" /> Processus
          </Button>
        </div>
        <h2 className="text-5xl font-bold text-white mb-4">₹5,000</h2>
      </div>

      <div className="bg-white rounded-t-3xl px-4 py-6 h-full">
        <Card className="border shadow-sm rounded-xl overflow-hidden bg-white mb-6">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">I want money</p>
              <h3 className="text-4xl font-bold mb-4">₹3,250</h3>
              
              <div className="w-full bg-gray-200 h-2 rounded-full mb-1">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>1000</span>
                <span>2500</span>
                <span>3000</span>
                <span>4000</span>
                <span>5000</span>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-gray-600">For term:</p>
                  <div className="flex items-center">
                    <h4 className="text-xl font-bold">3 months</h4>
                    <div className="ml-3 bg-green-100 p-1 rounded-md">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0"
                >
                  VIEW DETAILS
                </Button>
              </div>
              
              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <p className="text-gray-600">Disbursement amount</p>
                <p className="font-semibold">₹4,750 <ExternalLink className="h-4 w-4 inline ml-1 text-gray-400" /></p>
              </div>
              
              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <p className="text-gray-600">Repayment amount</p>
                <p className="font-semibold">₹3,950 <ExternalLink className="h-4 w-4 inline ml-1 text-gray-400" /></p>
              </div>
              
              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <p className="text-gray-600">Repayment date</p>
                <p className="font-semibold">20.05.2023 <Calendar className="h-4 w-4 inline ml-1 text-gray-400" /></p>
              </div>
              
              <div className="mt-4 flex items-start space-x-2">
                <Checkbox id="terms" className="mt-1" />
                <label htmlFor="terms" className="text-xs text-gray-500">
                  I have read and agree to the Terms & Conditions of RupeeRedee
                </label>
              </div>
              
              <Button 
                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-6 rounded-xl font-bold text-lg"
              >
                ACCEPT
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">BEST OFFER ONLY TODAY 🔥</h3>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm mb-1">Get line of credit up to ↗</p>
            <h2 className="text-4xl font-bold mb-4">₹25,000</h2>
            
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold">
              GET FIRST LOAN
            </Button>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Online purchase loan</p>
                <h4 className="text-sm font-semibold mb-1">E-voucher with limit up to ₹25,000</h4>
                <div className="flex justify-end">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Coming soon...</p>
              </div>
              
              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">POP lending</p>
                <h4 className="text-sm font-semibold mb-1">Personal loans with personlised interest</h4>
                <div className="flex justify-end">
                  <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Coming soon...</p>
              </div>
            </div>
            
            <div className="flex items-center mt-4 mb-2">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Invite friends - get bonus points!</h4>
                <p className="text-xs text-gray-500">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLoanPage;

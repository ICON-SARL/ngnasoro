
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, DollarSign, Wallet, Clock, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from '@/hooks/useAccount';

const HomeLoanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { account } = useAccount();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';
  
  const loanCount = 2; // This would be fetched from a real API

  const goBack = () => {
    navigate('/mobile-flow');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
  };

  return (
    <div className="h-full bg-white p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={goBack} className="p-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Avatar className="h-10 w-10 bg-yellow-100">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt={firstName} />
          ) : (
            <User className="h-6 w-6 text-yellow-800" />
          )}
        </Avatar>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold">Hi, {firstName}</h1>
        <p className="text-gray-600 mt-1">Currently you have {loanCount} loans.</p>
      </div>

      <div className="mb-8">
        <p className="text-gray-600 mb-1">Current Balance</p>
        <h2 className="text-5xl font-bold">{formatCurrency(account?.balance || 0)}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="overflow-hidden border rounded-xl bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <Wallet className="h-5 w-5 text-green-800" />
              </div>
              <span className="text-sm">Loans Amount</span>
            </div>
            <p className="text-2xl font-bold">$159.20</p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border rounded-xl bg-white">
          <CardContent className="p-4">
            <div className="flex items-center mb-2">
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                <Clock className="h-5 w-5 text-gray-800" />
              </div>
              <span className="text-sm">Yearly Payment</span>
            </div>
            <p className="text-2xl font-bold">$159.20</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Quick Link</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="overflow-hidden border rounded-xl hover:shadow cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Wallet className="h-5 w-5 text-green-800" />
                </div>
                <span className="font-medium">Apply for a loan</span>
              </div>
              <div className="h-8 w-8 bg-green-900 rounded-full flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border rounded-xl bg-green-50 hover:shadow cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <DollarSign className="h-5 w-5 text-green-800" />
                </div>
                <span className="font-medium">Make a loan payment</span>
              </div>
              <div className="h-8 w-8 bg-green-900 rounded-full flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" className="rounded-xl">
            View All
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Loan Offer</h2>
          <Button variant="outline" size="sm" className="rounded-xl">
            View All
          </Button>
        </div>
        
        <Card className="overflow-hidden border rounded-xl bg-green-50 p-4">
          <CardContent className="p-0">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Special Offer</h3>
                <p className="text-sm text-gray-600">Get a low interest loan today!</p>
              </div>
              <Button className="bg-green-900 rounded-xl text-white hover:bg-green-800">
                Apply Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomeLoanPage;

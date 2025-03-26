
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, DollarSign, Wallet, Clock, ArrowRight, User, Bell, ActivitySquare, ExternalLink, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from '@/hooks/useAccount';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

const HomeLoanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { account } = useAccount();
  const [loanAmount, setLoanAmount] = useState(3250);
  const [termMonths, setTermMonths] = useState(3);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';
  
  const goBack = () => {
    navigate('/mobile-flow');
  };

  const handleLoanAmountChange = (value: number[]) => {
    setLoanAmount(value[0]);
  };

  const viewLoanProcess = () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lovable:action', { 
        detail: { action: 'Loan Process' } 
      });
      window.dispatchEvent(event);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
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
          <h1 className="text-2xl font-bold text-white">Approved limit up to <span>↗</span></h1>
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
        <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white mb-6">
          <CardContent className="p-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-600">I want money</p>
                <div className="flex items-center">
                  <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-4xl font-bold mb-4">{formatCurrency(loanAmount)}</h3>
              
              <div className="mb-4">
                <Slider 
                  defaultValue={[loanAmount]} 
                  max={5000} 
                  min={1000} 
                  step={250}
                  onValueChange={handleLoanAmountChange}
                  className="w-full"
                />
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
                    <h4 className="text-xl font-bold">{termMonths} months</h4>
                    <div className="ml-3 bg-green-100 p-1 rounded-full flex items-center justify-center">
                      <div className="h-4 w-4 bg-green-400 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
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
                <div className="flex items-center">
                  <p className="font-semibold">{formatCurrency(4750)}</p>
                  <div className="ml-1 h-4 w-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <ExternalLink className="h-2 w-2 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <p className="text-gray-600">Repayment amount</p>
                <div className="flex items-center">
                  <p className="font-semibold">{formatCurrency(3950)}</p>
                  <div className="ml-1 h-4 w-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <ExternalLink className="h-2 w-2 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-t border-gray-100">
                <p className="text-gray-600">Repayment date</p>
                <div className="flex items-center">
                  <p className="font-semibold">20.05.2023</p>
                  <div className="ml-1 h-4 w-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-2 w-2 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-start space-x-2">
                <Checkbox 
                  id="terms" 
                  className="mt-1" 
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-xs text-gray-500">
                  I have read and agree to the Terms & Conditions of RupeeRedee
                </label>
              </div>
              
              <Button 
                className={`w-full mt-4 py-6 rounded-xl font-bold text-lg ${acceptTerms ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                disabled={!acceptTerms}
              >
                ACCEPT
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold">BEST OFFER ONLY TODAY 🔥</h3>
            <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm mb-1">Get line of credit up to ↗</p>
                <h2 className="text-3xl font-bold mb-2">₹25,000</h2>
              </div>
              <img 
                src="/lovable-uploads/006177a9-5cd7-4b31-9abb-0760a787e66f.png" 
                alt="Mascot" 
                className="h-12 w-12" 
              />
            </div>
            
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold">
              GET FIRST LOAN
            </Button>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">Online purchase loan</p>
                <h4 className="text-sm font-semibold mb-1">E-voucher with limit up to ₹25,000</h4>
                <div className="flex justify-end">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="h-6 w-6 bg-blue-400 rounded-full flex items-center justify-center">
                      <DollarSign className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Coming soon...</p>
              </div>
              
              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-600 mb-1">POP lending</p>
                <h4 className="text-sm font-semibold mb-1">Personal loans with personlised interest</h4>
                <div className="flex justify-end">
                  <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Wallet className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Coming soon...</p>
              </div>
            </div>
            
            <div className="flex items-center mt-4 mb-2">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <div className="h-6 w-6 bg-green-400 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
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

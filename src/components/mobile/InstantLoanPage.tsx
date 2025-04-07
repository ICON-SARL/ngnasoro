
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Zap, Shield, Clock, ChevronRight, ChevronDown, ChevronUp,
  CreditCard, PieChart, CheckCircle, Plus, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

const InstantLoanPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loanAmount, setLoanAmount] = useState(3250);
  const [preApproved, setPreApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOffers, setShowOffers] = useState(false);
  const [creditScore, setCreditScore] = useState(720);
  
  const handleLoanAmountChange = (value: number[]) => {
    setLoanAmount(value[0]);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  useEffect(() => {
    // Simulate loading and eligibility check
    const timer = setTimeout(() => {
      setLoading(false);
      setPreApproved(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleApplyLoan = () => {
    toast({
      title: "Demande initiée",
      description: "Votre demande de prêt a été initiée avec succès"
    });
    navigate('/mobile-flow/loan-agreement');
  };

  const viewLoanProcess = () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lovable:action', { 
        detail: { action: 'Loan Process' } 
      });
      window.dispatchEvent(event);
    }
    navigate('/mobile-flow/loan-process');
  };

  return (
    <div className="h-full bg-gradient-to-b from-blue-600 to-blue-500 pb-20">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/2b4e263e-7201-487a-a83d-f4c8ae811a48.png" 
              alt="Loan Eligibility" 
              className="h-10 w-10 rounded-full bg-white p-1" 
            />
            <h1 className="text-xl font-bold text-white">InstantLoan</h1>
          </div>
        </div>
        <Bell className="h-6 w-6 text-white" />
      </div>

      {/* Main header content */}
      <div className="px-4 pb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Approved limit up to <span>↗</span></h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center text-xs bg-blue-500 text-white border-blue-400 hover:bg-blue-600 hover:text-white"
            onClick={viewLoanProcess}
          >
            <Plus className="h-3 w-3 mr-1" /> Processus
          </Button>
        </div>
        <h2 className="text-5xl font-bold text-white mb-4">₹5,000</h2>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-t-3xl px-4 py-6">
        {loading ? (
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white mb-6">
            <CardContent className="p-5 flex flex-col items-center justify-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">Vérification de votre éligibilité...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Eligibility Status Card */}
            {preApproved && (
              <Card className="border-0 shadow-sm bg-gradient-to-r from-green-50 to-blue-50 rounded-xl overflow-hidden mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <Badge className="bg-green-100 text-green-800 border-0">Pré-approuvé</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-1">Vous êtes éligible pour un prêt instantané!</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Votre score de crédit de {creditScore} vous donne accès à des offres spéciales
                  </p>
                  
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg mb-3">
                    <div className="flex items-center">
                      <PieChart className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm">Score de crédit</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold mr-2">{creditScore}</span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{width: `${(creditScore/900)*100}%`}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/mobile-flow/loan-agreement')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Obtenir le prêt instantanément
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loan Amount Selector */}
            <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-white mb-6">
              <CardContent className="p-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-gray-600">I want money</p>
                    <div className="flex items-center">
                      <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-4xl font-bold mb-4">{formatCurrency(loanAmount)}</h3>
                  
                  <div className="mb-4">
                    <Slider 
                      value={[loanAmount]} 
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
                  
                  <div className="pt-4 border-t border-gray-100">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
                      onClick={handleApplyLoan}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Key Features */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Key Features</h3>
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-blue-50 border-0">
                  <CardContent className="p-3">
                    <Zap className="h-6 w-6 text-blue-500 mb-2" />
                    <h4 className="text-sm font-medium">Disbursement</h4>
                    <p className="text-xs text-gray-600">Instant approval & disbursement</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50 border-0">
                  <CardContent className="p-3">
                    <Shield className="h-6 w-6 text-green-500 mb-2" />
                    <h4 className="text-sm font-medium">0% Processing Fee</h4>
                    <p className="text-xs text-gray-600">No hidden charges</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-amber-50 border-0">
                  <CardContent className="p-3">
                    <Clock className="h-6 w-6 text-amber-500 mb-2" />
                    <h4 className="text-sm font-medium">Flexible Tenure</h4>
                    <p className="text-xs text-gray-600">3-18 months repayment</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50 border-0">
                  <CardContent className="p-3">
                    <User className="h-6 w-6 text-purple-500 mb-2" />
                    <h4 className="text-sm font-medium">Minimal KYC</h4>
                    <p className="text-xs text-gray-600">Fast & secure verification</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Special Offers */}
            <Card className="border border-dashed border-blue-300 bg-blue-50 rounded-xl mb-6">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-blue-800">Special Offers</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 p-0 h-auto"
                    onClick={() => setShowOffers(!showOffers)}
                  >
                    {showOffers ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </Button>
                </div>
                
                {showOffers && (
                  <div className="space-y-3 animate-in fade-in-50 duration-300">
                    <div className="flex items-center bg-white p-2 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">First-time borrower bonus</h4>
                        <p className="text-xs text-gray-600">Get 50% off on interest rate</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-white p-2 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Refer a friend</h4>
                        <p className="text-xs text-gray-600">Both get ₹500 cashback</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* How it works */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">How it works</h3>
              <div className="space-y-3">
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium">1</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Apply Online</h4>
                    <p className="text-xs text-gray-600">Select loan amount and fill basic details</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium">2</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Quick Verification</h4>
                    <p className="text-xs text-gray-600">We verify your eligibility instantly</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium">3</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Receive Money</h4>
                    <p className="text-xs text-gray-600">Money transferred to your account immediately</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation - Intentionally left out as it's handled by MobileNavigation component */}
    </div>
  );
};

export default InstantLoanPage;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Plus, Home, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

const HomeLoanPage = () => {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState(3250);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const viewLoanProcess = () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lovable:action', { 
        detail: { action: 'Loan Process' } 
      });
      window.dispatchEvent(event);
    }
    navigate('/mobile-flow/loan-process');
  };

  const handleLoanAmountChange = (value: number[]) => {
    setLoanAmount(value[0]);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const handleApplyLoan = () => {
    // Submit loan application
    navigate('/mobile-flow/loan-agreement');
  };

  return (
    <div className="h-full bg-blue-600 pb-20">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/e8357419-009f-4b77-8913-c4e5bceddb72.png" 
              alt="InstantLoan Logo" 
              className="h-8 w-8" 
            />
            <h1 className="text-xl font-bold text-white">InstantLoan</h1>
          </div>
        </div>
        <Bell className="h-6 w-6 text-white" />
      </div>

      <div className="px-4 pb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Limite approuvée jusqu'à <span>↗</span></h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center text-xs bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white"
            onClick={viewLoanProcess}
          >
            <Plus className="h-3 w-3 mr-1" /> Processus
          </Button>
        </div>
        <h2 className="text-5xl font-bold text-white mb-4">5 000 FCFA</h2>
      </div>

      <div className="bg-white rounded-t-3xl px-4 py-6">
        <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-gray-50 mb-6">
          <CardContent className="p-4">
            <Badge className="bg-green-100 text-green-800 mb-4 font-medium">
              Pré-approuvé
            </Badge>
            
            <h3 className="text-2xl font-bold mb-2">Vous êtes éligible pour un prêt instantané!</h3>
            <p className="text-gray-600 mb-4">Votre score de crédit de 720 vous donne accès à des offres spéciales.</p>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-600">Montant souhaité</p>
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
                <span>3500</span>
                <span>5000</span>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
                  onClick={handleApplyLoan}
                >
                  Demander Maintenant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Prêts actifs */}
        <div className="mb-4">
          <h3 className="text-lg font-bold mb-3">Mes prêts actifs</h3>
          
          <Card className="mb-3 border-0 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">Microfinance Bamako</h4>
                  <p className="text-sm text-gray-500">Approuvé le 05/06/2023</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">25 400 FCFA</p>
                  <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm" className="mr-2" onClick={() => navigate('/mobile-flow/loan-details')}>
                  Détails
                </Button>
                <Button size="sm" className="bg-blue-600" onClick={() => navigate('/mobile-flow/payment')}>
                  <ArrowUp className="h-4 w-4 mr-1" /> Rembourser
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-3 border-0 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">SFD Primaire</h4>
                  <p className="text-sm text-gray-500">Approuvé le 10/05/2023</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">15 500 FCFA</p>
                  <Badge className="bg-green-100 text-green-800">Remboursé</Badge>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm">
                  Détails
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeLoanPage;

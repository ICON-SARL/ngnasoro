
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

const LoanRequest = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardContent className="p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 text-gray-500" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Pas de prêts actifs</h2>
          <p className="text-gray-500 mb-6">Vous n'avez pas de prêts en cours</p>
          
          <Button 
            onClick={() => navigate('/mobile-flow/loan-plans')}
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            Demander un prêt
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanRequest;

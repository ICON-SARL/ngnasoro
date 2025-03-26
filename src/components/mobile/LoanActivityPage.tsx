
import React, { useState } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface LoanProps {
  id: string;
  type: string;
  amount: number;
  approvedDate: string;
  status: 'Remboursé' | 'En retard' | 'Approuvé';
  icon?: React.ReactNode;
}

const LoanActivityPage = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<LoanProps[]>([
    {
      id: '1',
      type: 'Microfinance Bamako',
      amount: 25400,
      approvedDate: '02/06/2023',
      status: 'Approuvé',
      icon: <CreditCard className="h-5 w-5 text-lime-800" />
    },
    {
      id: '2',
      type: 'Boutique Déco',
      amount: 15500,
      approvedDate: '10/05/2023',
      status: 'Remboursé',
      icon: <CreditCard className="h-5 w-5 text-lime-800" />
    },
    {
      id: '3',
      type: 'Supermarché Sahara',
      amount: 5800,
      approvedDate: '15/04/2023',
      status: 'En retard',
      icon: <CreditCard className="h-5 w-5 text-lime-800" />
    }
  ]);

  const goBack = () => {
    navigate('/mobile-flow/home-loan');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  return (
    <div className="h-full bg-white p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="p-2 mr-4" onClick={goBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-bold">Activité des prêts</h1>
      </div>

      <div className="space-y-4">
        {loans.map((loan) => (
          <Card key={loan.id} className="overflow-hidden border rounded-xl shadow-sm">
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-lime-100 rounded-full flex items-center justify-center mr-4">
                      {loan.icon}
                    </div>
                    <h3 className="text-xl font-bold tracking-tighter">{loan.type}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-semibold">
                      {formatCurrency(loan.amount)}
                    </span>
                    <div className="text-sm text-gray-500">
                      Approuvé le {loan.approvedDate}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <Badge 
                    className={`rounded-full px-4 py-1 ${
                      loan.status === 'Remboursé' 
                        ? 'bg-lime-100 text-lime-800' 
                        : loan.status === 'En retard' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {loan.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/mobile-flow/loan-details')}
                  >
                    Détails
                  </Button>
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

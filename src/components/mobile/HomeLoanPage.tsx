
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HomeLoanHeader from './loan/HomeLoanHeader';
import TransactionList from './TransactionList';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';

const HomeLoanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions, isLoading } = useTransactions(user?.id || '', user?.id ? 'default-sfd' : '');
  
  const formattedTransactions = transactions.map(transaction => ({
    id: transaction.id,
    name: transaction.name,
    type: transaction.type,
    amount: `${transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString('fr-FR')} FCFA`,
    date: new Date(transaction.date || transaction.created_at).toLocaleDateString('fr-FR'),
    avatar: transaction.avatar_url,
    sfdName: transaction.type === 'loan_disbursement' ? 'SFD' : undefined
  }));
  
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
    <div className="h-full bg-blue-600 pb-20">
      <HomeLoanHeader onViewLoanProcess={viewLoanProcess} />

      <div className="bg-white rounded-t-3xl px-4 py-6">
        <Card className="border-0 shadow-sm rounded-xl overflow-hidden bg-gray-50 mb-6">
          <CardContent className="p-4">
            <Badge className="bg-green-100 text-green-800 mb-4 font-medium">
              Pré-approuvé
            </Badge>
            
            <h3 className="text-2xl font-bold mb-2">Vous êtes éligible pour un prêt instantané!</h3>
            <p className="text-gray-600 mb-4">Votre score de crédit de 720 vous donne accès à des offres spéciales.</p>
            
            <div className="pt-4 border-t border-gray-100">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
                onClick={() => navigate('/mobile-flow/loan-agreement')}
              >
                Demander Maintenant
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mb-6">
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
                <Button variant="outline" size="sm" onClick={() => navigate('/mobile-flow/loan-details')}>
                  Détails
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-3 border-0 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">Supermarché Sahara</h4>
                  <p className="text-sm text-gray-500">Approuvé le 15/04/2023</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">5 800 FCFA</p>
                  <Badge className="bg-red-100 text-red-800">En retard</Badge>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => navigate('/mobile-flow/loan-details')}>
                  Détails
                </Button>
                <Button size="sm" className="bg-blue-600" onClick={() => navigate('/mobile-flow/payment')}>
                  <ArrowUp className="h-4 w-4 mr-1" /> Rembourser
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            className="w-full border border-gray-200 bg-white text-blue-600 hover:bg-gray-50" 
            onClick={() => navigate('/mobile-flow/loan-activity')}
          >
            Voir tous les prêts
          </Button>
        </div>
        
        <TransactionList 
          transactions={formattedTransactions} 
          isLoading={isLoading}
          onViewAll={() => navigate('/mobile-flow/loan-activity')}
          title="Transactions Récentes"
        />
      </div>
    </div>
  );
};

export default HomeLoanPage;

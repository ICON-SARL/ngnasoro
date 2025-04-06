
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ChevronRight, CreditCard, PiggyBank, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MainDashboardProps {
  onAction?: (action: string) => void;
  account?: any;
  transactions?: any[];
  transactionsLoading?: boolean;
  toggleMenu?: () => void;
}

const MobileDashboard: React.FC<MainDashboardProps> = ({
  onAction,
  account,
  transactions = [],
  transactionsLoading = false,
  toggleMenu
}) => {
  const { user } = useAuth();
  
  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <MobileHeader title="Tableau de Bord" showMenu={true} onMenuClick={toggleMenu} />
      
      <div className="container p-4 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Bienvenue sur l'application mobile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Cette application vous permet de gérer vos clients et crédits SFD.
            </p>
            
            {user ? (
              <div className="p-3 bg-green-50 rounded-md border border-green-100">
                <p className="text-green-800 font-medium">Connecté en tant que:</p>
                <p className="text-green-700">{user.email}</p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-md border border-amber-100">
                <p className="text-amber-800">Veuillez vous connecter pour accéder à toutes les fonctionnalités.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-3">
          <Card className="col-span-1">
            <CardContent className="p-4">
              <div className="flex flex-col h-full">
                <div className="rounded-full w-10 h-10 bg-blue-100 flex items-center justify-center mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium mb-1">Clients</h3>
                <p className="text-xs text-gray-500 mb-3 flex-grow">Gérez vos clients SFD</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-auto"
                  onClick={() => handleAction('clients')}
                  asChild
                >
                  <Link to="/mobile-flow/clients">
                    Accéder
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardContent className="p-4">
              <div className="flex flex-col h-full">
                <div className="rounded-full w-10 h-10 bg-green-100 flex items-center justify-center mb-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-medium mb-1">Crédits</h3>
                <p className="text-xs text-gray-500 mb-3 flex-grow">Gérez les prêts</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-auto"
                  onClick={() => handleAction('loans')}
                >
                  Accéder
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {transactionsLoading ? (
          <Card>
            <CardContent className="p-4 text-center py-8">
              <p className="text-sm text-gray-500">Chargement des transactions...</p>
            </CardContent>
          </Card>
        ) : transactions.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Transactions récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 3).map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{transaction.description || 'Transaction'}</p>
                      <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} FCFA
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default MobileDashboard;

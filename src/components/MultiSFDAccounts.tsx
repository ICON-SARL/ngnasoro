
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useNavigate } from 'react-router-dom';

export const MultiSFDAccounts: React.FC = () => {
  const { activeSfdAccount, makeLoanPayment } = useSfdAccounts();
  const [activeTab, setActiveTab] = useState('savings');
  const { activeSfdId, setActiveSfdId } = useAuth();
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate('/account/sfds');
  };

  const handleMakePayment = (loanId: string) => {
    // Placeholder for making a loan payment
    if (makeLoanPayment && typeof makeLoanPayment.mutate === 'function') {
      makeLoanPayment.mutate({
        loanId,
        amount: 10000, // Example amount
        paymentMethod: 'app'
      });
    }
  };

  // If no active account, show a placeholder
  if (!activeSfdAccount) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center p-4">
            <h3 className="text-lg font-medium mb-2">Aucun compte SFD actif</h3>
            <p className="text-sm text-gray-500 mb-4">
              Vous n'avez aucun compte SFD connecté ou actif.
            </p>
            <Button 
              onClick={() => navigate('/account/sfds')}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              Voir mes SFDs
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get loans from active account
  const loans = activeSfdAccount.loans || [];

  return (
    <Card className="mb-6 overflow-visible">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-2">
              {activeSfdAccount.logo_url || activeSfdAccount.logoUrl ? (
                <AvatarImage src={activeSfdAccount.logo_url || activeSfdAccount.logoUrl} alt={activeSfdAccount.name} />
              ) : (
                <AvatarFallback className="bg-[#0D6A51] text-white">
                  {activeSfdAccount.name?.charAt(0) || 'S'}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-bold">{activeSfdAccount.name}</h3>
              <p className="text-xs text-gray-500">{activeSfdAccount.description || "Compte principal"}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleViewAll}>
            Tout voir
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="savings" className="flex-1">Épargne</TabsTrigger>
            <TabsTrigger value="loans" className="flex-1">Prêts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="savings" className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-1">Solde disponible</h4>
              <p className="text-2xl font-bold">{formatCurrency(activeSfdAccount.balance || 0)}</p>
              <p className="text-xs text-gray-500">Dernière mise à jour: {new Date().toLocaleTimeString()}</p>
            </div>
            
            <Button 
              onClick={() => navigate('/mobile-flow/funds')} 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              Gérer mes fonds
            </Button>
          </TabsContent>
          
          <TabsContent value="loans" className="space-y-4">
            {loans.length > 0 ? (
              <div className="space-y-3">
                {loans.map(loan => (
                  <div key={loan.id} className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        {activeSfdAccount.logo_url || activeSfdAccount.logoUrl ? (
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage 
                              src={activeSfdAccount.logo_url || activeSfdAccount.logoUrl} 
                              alt={activeSfdAccount.name} 
                            />
                          </Avatar>
                        ) : null}
                        <h4 className="font-medium text-sm">{loan.purpose || "Prêt"}</h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        Échéance: {loan.nextDueDate ? new Date(loan.nextDueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleMakePayment(loan.id)}
                    >
                      Payer
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <h4 className="font-medium mb-1">Aucun prêt actif</h4>
                <p className="text-sm text-gray-500">
                  Vous n'avez actuellement aucun prêt actif avec cette SFD.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MultiSFDAccounts;

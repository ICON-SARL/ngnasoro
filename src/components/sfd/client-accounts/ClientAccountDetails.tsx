
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactions } from '@/hooks/transactions';
import { Loader } from '@/components/ui/loader';
import { CreditCard, ArrowUpDown, Plus, Minus, History, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AccountOperationDialog from './AccountOperationDialog';

interface ClientAccountDetailsProps {
  clientId: string;
  clientName: string;
  phone?: string;
}

const ClientAccountDetails: React.FC<ClientAccountDetailsProps> = ({ 
  clientId, 
  clientName,
  phone
}) => {
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const { getBalance, isLoading, fetchTransactions, transactions } = useTransactions(clientId);
  
  const loadBalance = async () => {
    const currentBalance = await getBalance();
    setBalance(currentBalance);
  };

  useEffect(() => {
    loadBalance();
    fetchTransactions();
  }, [clientId]);

  const handleOperationComplete = () => {
    loadBalance();
    fetchTransactions();
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-[#0D6A51]" />
          Compte client {phone && <span className="text-sm ml-2 text-gray-500">({phone})</span>}
        </CardTitle>
        <CardDescription>
          Gestion du compte et des opérations pour {clientName}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader size="md" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-[#F8F9FC] p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Solde actuel</div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadBalance}
                  className="h-7 w-7 p-0"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-gray-500" />
                </Button>
              </div>
              <div className="text-2xl font-semibold text-[#0D6A51]">
                {balance?.toLocaleString('fr-FR')} FCFA
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Dernière mise à jour: {format(new Date(), 'PPP', { locale: fr })}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => setIsOperationDialogOpen(true)}
                className="flex-1 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              >
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Crédit / Débit
              </Button>
            </div>
            
            {transactions && transactions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Transactions récentes</h4>
                <div className="space-y-2">
                  {transactions.slice(0, 3).map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-md border border-gray-100"
                    >
                      <div className="flex items-center">
                        {transaction.amount > 0 ? (
                          <Plus className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <Minus className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        <div>
                          <div className="text-sm font-medium">
                            {transaction.name || (transaction.amount > 0 ? 'Dépôt' : 'Retrait')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.created_at && format(new Date(transaction.created_at), 'Pp', { locale: fr })}
                          </div>
                        </div>
                      </div>
                      <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}
                        {transaction.amount.toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                >
                  <History className="h-3.5 w-3.5 mr-1" />
                  Voir toutes les transactions
                </Button>
              </div>
            )}
            
            <AccountOperationDialog
              isOpen={isOperationDialogOpen}
              onClose={() => setIsOperationDialogOpen(false)}
              clientId={clientId}
              clientName={clientName}
              onOperationComplete={handleOperationComplete}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientAccountDetails;

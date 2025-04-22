
import React, { useState } from 'react';
import { useClientSavingsAccount } from '@/hooks/useClientSavingsAccount';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AccountOperationDialog from './client-accounts/AccountOperationDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Banknote, ArrowDownUp, PiggyBank, RefreshCw } from 'lucide-react';

interface ClientSavingsAccountProps {
  clientId: string;
  clientName: string;
}

const ClientSavingsAccount: React.FC<ClientSavingsAccountProps> = ({ clientId, clientName }) => {
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);
  
  const {
    account,
    isLoading,
    transactions,
    createAccount,
    refreshData
  } = useClientSavingsAccount(clientId);

  const handleCreateAccount = async () => {
    await createAccount(0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D6A51]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Compte d'épargne</CardTitle>
          <CardDescription>
            {account ? 'Gestion du compte épargne client' : 'Le client n\'a pas encore de compte d\'épargne'}
          </CardDescription>
        </div>
        {account && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshData()}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {account ? (
          <div className="space-y-4">
            <div className="rounded-md bg-[#F8F9FC] p-4">
              <div className="mb-2 text-sm font-medium">Solde actuel</div>
              <div className="text-2xl font-semibold text-[#0D6A51]">
                {account.balance.toLocaleString('fr-FR')} {account.currency || 'FCFA'}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Dernière mise à jour: {format(new Date(account?.last_updated || Date.now()), 'PPP', { locale: fr })}
              </div>
            </div>

            <Button 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => setIsOperationDialogOpen(true)}
            >
              <Banknote className="mr-2 h-4 w-4" />
              Effectuer une opération
            </Button>

            <AccountOperationDialog 
              isOpen={isOperationDialogOpen}
              onClose={() => setIsOperationDialogOpen(false)}
              clientId={clientId}
              clientName={clientName}
              onOperationComplete={refreshData}
            />
          </div>
        ) : (
          <div className="text-center py-6">
            <Button 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={handleCreateAccount}
            >
              <PiggyBank className="mr-2 h-4 w-4" />
              Créer un compte d'épargne
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientSavingsAccount;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClientSavingsAccount, ClientBalanceOperation } from '@/types/sfdClients';

interface ClientSavingsManagementProps {
  account: ClientSavingsAccount | null;
  transactions: ClientBalanceOperation[];
  isLoading: boolean;
}

const ClientSavingsManagement: React.FC<ClientSavingsManagementProps> = ({ account, transactions, isLoading }) => {

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatLastTransactionDate = (account: any) => {
    if (!account || !account.last_updated) return "N/A";
    return new Date(account.last_updated).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compte Épargne</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p>Chargement des informations du compte...</p>
        ) : account ? (
          <>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Titulaire du compte</p>
                <p className="text-sm text-muted-foreground">ID du client: {account.client_id}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Solde actuel</p>
              <p className="text-2xl font-bold">{formatCurrency(account.balance, account.currency)}</p>
              <p className="text-sm text-muted-foreground">
                Statut du compte: <Badge variant="secondary">{account.status}</Badge>
              </p>
              <p className="text-sm text-muted-foreground">
                Dernière transaction: {formatLastTransactionDate(account)}
              </p>
            </div>
            <div>
              <h3 className="text-md font-semibold">Historique des Transactions</h3>
              <ScrollArea className="h-[200px] w-full rounded-md border">
                <div className="p-4">
                  {transactions.length > 0 ? (
                    <ul className="space-y-2">
                      {transactions.map(transaction => (
                        <li key={transaction.id} className="border-b pb-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{transaction.operation_type}</span>
                            <span>{formatCurrency(transaction.amount, account.currency)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{transaction.description || 'Aucune description'}</p>
                          <p className="text-xs text-muted-foreground">
                            Effectué le: {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Aucune transaction disponible pour ce compte.</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </>
        ) : (
          <p>Aucun compte épargne trouvé.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientSavingsManagement;

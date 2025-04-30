
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { useSavingsAccount } from '@/hooks/useSavingsAccount';
import { Loader } from '@/components/ui/loader';
import { BankAccountDialog } from './BankAccountDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AccountOperationDialog from './AccountOperationDialog';
import { useToast } from '@/hooks/use-toast';

interface ClientBankAccountTabProps {
  client: any;
}

export function ClientBankAccountTab({ client }: ClientBankAccountTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { 
    account, 
    isLoading,
    refetch,
    transactions
  } = useSavingsAccount(client?.id);

  const handleRefresh = () => {
    refetch();
  };

  const handleOperationComplete = () => {
    refetch();
    toast({
      title: "Opération réussie",
      description: "Le compte a été mis à jour avec succès"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Comptes bancaires</h3>
        {account && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Actualiser
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-6">
          <Loader size="md" />
        </div>
      ) : account ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Compte d'épargne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Solde actuel</h4>
                  <p className="text-2xl font-semibold text-green-700">
                    {account.balance?.toLocaleString('fr-FR')} {account.currency || 'FCFA'}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {account.id ? account.id.substring(0, 8) : 'Compte bancaire'} - {client?.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Mis à jour le {format(new Date(account.last_updated || account.updated_at || Date.now()), 'Pp', { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button 
                  onClick={() => setIsOperationDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <ArrowDown className="h-4 w-4 mr-1" /> Dépôt / Retrait
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Affichage des transactions récentes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Transactions récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border-b">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-full ${
                          tx.type === 'deposit' || tx.amount > 0 
                            ? 'bg-green-100' 
                            : 'bg-blue-100'
                        }`}>
                          {tx.type === 'deposit' || tx.amount > 0 ? (
                            <ArrowDown className="h-4 w-4 text-green-700" />
                          ) : (
                            <ArrowUp className="h-4 w-4 text-blue-700" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(tx.created_at || tx.date || Date.now()).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <p className={`font-bold ${
                        tx.type === 'deposit' || tx.amount > 0 
                          ? 'text-green-700' 
                          : 'text-gray-700'
                      }`}>
                        {tx.type === 'deposit' || tx.amount > 0 ? '+' : '-'}
                        {Math.abs(tx.amount).toLocaleString()} FCFA
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Aucune transaction récente
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-gray-100 p-3">
                <Wallet className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 mb-4">Aucun compte bancaire enregistré</p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" /> Créer un compte d'épargne
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <BankAccountDialog 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
        clientId={client?.id}
        onSuccess={handleRefresh}
      />

      <AccountOperationDialog
        isOpen={isOperationDialogOpen}
        onClose={() => setIsOperationDialogOpen(false)}
        clientId={client?.id}
        clientName={client?.full_name}
        onOperationComplete={handleOperationComplete}
      />
    </div>
  );
}

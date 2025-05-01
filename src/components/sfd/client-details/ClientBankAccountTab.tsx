
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, RefreshCw, ArrowUp, ArrowDown, UserPlus } from 'lucide-react';
import { useSavingsAccount } from '@/hooks/useSavingsAccount';
import { Loader } from '@/components/ui/loader';
import { BankAccountDialog } from './BankAccountDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AccountOperationDialog from './AccountOperationDialog';
import { useToast } from '@/hooks/use-toast';
import { clientUserService } from '@/services/clientUserService';

interface ClientBankAccountTabProps {
  client: any;
}

export function ClientBankAccountTab({ client }: ClientBankAccountTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [clientData, setClientData] = useState(client);
  const { toast } = useToast();
  
  const { 
    account, 
    isLoading,
    refetch,
    transactions
  } = useSavingsAccount(clientData?.id);

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Actualisation",
      description: "Les données du compte ont été actualisées"
    });
  };

  const handleOperationComplete = () => {
    refetch();
    toast({
      title: "Opération réussie",
      description: "Le compte a été mis à jour avec succès"
    });
  };

  const handleCreateUser = async () => {
    setIsCreatingUser(true);
    try {
      const result = await clientUserService.createUserAccount(clientData.id);
      
      if (result.success) {
        toast({
          title: "Compte utilisateur créé",
          description: "Un compte utilisateur a été créé pour ce client avec succès"
        });
        
        // Update client data with the returned data containing user_id
        if (result.client) {
          setClientData(result.client);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la création du compte utilisateur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer un compte utilisateur pour ce client",
        variant: "destructive"
      });
    } finally {
      setIsCreatingUser(false);
    }
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
                    ID: {account.id ? account.id.substring(0, 8) : 'Compte bancaire'} - {clientData?.full_name}
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
                            {format(new Date(tx.created_at || tx.date || Date.now()), 'Pp', { locale: fr })}
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
                {!clientData.user_id ? (
                  <>
                    <p className="text-amber-600 mb-4">Ce client ne dispose pas de compte utilisateur</p>
                    <Button 
                      onClick={handleCreateUser}
                      className="mb-4"
                      disabled={isCreatingUser}
                    >
                      {isCreatingUser ? (
                        <><Loader size="sm" className="mr-2" /> Création en cours...</>
                      ) : (
                        <><UserPlus className="h-4 w-4 mr-2" /> Créer un compte utilisateur</>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Créer un compte d'épargne
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <BankAccountDialog 
        isOpen={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)} 
        clientId={clientData?.id}
        onSuccess={handleRefresh}
      />

      <AccountOperationDialog
        isOpen={isOperationDialogOpen}
        onClose={() => setIsOperationDialogOpen(false)}
        clientId={clientData?.id}
        clientName={clientData?.full_name}
        onOperationComplete={handleOperationComplete}
      />
    </div>
  );
}

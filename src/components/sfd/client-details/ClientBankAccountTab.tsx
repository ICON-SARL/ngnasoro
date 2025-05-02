
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, RefreshCw, ArrowUp, ArrowDown, UserPlus, Link } from 'lucide-react';
import { useSavingsAccount } from '@/hooks/useSavingsAccount';
import { Loader } from '@/components/ui/loader';
import { BankAccountDialog } from './BankAccountDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AccountOperationDialog from './AccountOperationDialog';
import { useToast } from '@/hooks/use-toast';
import { clientUserService } from '@/services/clientUserService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClientBankAccountTabProps {
  client: any;
}

export function ClientBankAccountTab({ client }: ClientBankAccountTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isSyncingUser, setIsSyncingUser] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [clientData, setClientData] = useState(client);
  const { toast } = useToast();
  
  const { 
    account, 
    isLoading,
    refetch,
    transactions
  } = useSavingsAccount(clientData?.id);

  useEffect(() => {
    if (client && client !== clientData) {
      setClientData(client);
    }
  }, [client]);

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

        // Create savings account automatically
        await handleEnsureSavingsAccount();
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

  const handleEnsureSavingsAccount = async () => {
    if (!clientData?.id) return;
    
    try {
      const result = await clientUserService.ensureSavingsAccount(clientData.id);
      
      if (result.success) {
        toast({
          title: result.accountExists ? "Compte épargne existant" : "Compte épargne créé",
          description: result.accountExists 
            ? "Le compte épargne existe déjà pour ce client" 
            : "Un compte épargne a été créé pour ce client"
        });
        refetch();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la création du compte épargne:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer un compte épargne pour ce client",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleSyncUserAccount = async () => {
    setIsSyncingUser(true);
    try {
      const result = await clientUserService.syncClientWithUserAndCreateAccount(clientData.id);
      
      if (result.success) {
        toast({
          title: "Synchronisation réussie",
          description: result.message || "Le client a été synchronisé avec son compte utilisateur"
        });
        
        if (result.user_id && result.user_id !== clientData.user_id) {
          setClientData({
            ...clientData,
            user_id: result.user_id
          });
        }
        
        refetch();
      } else if (result.error) {
        toast({
          title: "Erreur de synchronisation",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de synchroniser ce client avec un compte utilisateur",
        variant: "destructive"
      });
    } finally {
      setIsSyncingUser(false);
    }
  };

  const handleLinkToExisting = async () => {
    if (!linkEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer l'adresse email du compte à lier",
        variant: "destructive"
      });
      return;
    }
    
    setIsSyncingUser(true);
    try {
      const result = await clientUserService.linkToExistingAccount(clientData.id, linkEmail);
      
      if (result.success) {
        toast({
          title: "Compte lié avec succès",
          description: "Le client a été lié à un compte utilisateur existant"
        });
        
        if (result.client) {
          setClientData(result.client);
        }
        
        setIsLinkDialogOpen(false);
        setLinkEmail('');
        refetch();
      }
    } catch (error) {
      console.error("Erreur lors de la liaison avec un compte existant:", error);
      toast({
        title: "Erreur",
        description: "Impossible de lier ce client avec le compte utilisateur spécifié",
        variant: "destructive"
      });
    } finally {
      setIsSyncingUser(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader size="md" />
      </div>
    );
  }

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
      
      {account ? (
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
                    <div className="flex flex-col gap-3 mb-4">
                      <Button 
                        onClick={handleCreateUser}
                        className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                        disabled={isCreatingUser}
                      >
                        {isCreatingUser ? (
                          <><Loader size="sm" className="mr-2" /> Création en cours...</>
                        ) : (
                          <><UserPlus className="h-4 w-4 mr-2" /> Créer un compte utilisateur</>
                        )}
                      </Button>
                      <Button 
                        onClick={() => setIsLinkDialogOpen(true)}
                        variant="outline"
                        disabled={isSyncingUser}
                      >
                        <Link className="h-4 w-4 mr-2" /> Lier à un compte existant
                      </Button>
                      <Button
                        onClick={handleSyncUserAccount}
                        variant="outline"
                        className="mt-1"
                        disabled={isSyncingUser}
                      >
                        {isSyncingUser ? (
                          <><Loader size="sm" className="mr-2" /> Synchronisation...</>
                        ) : (
                          <><RefreshCw className="h-4 w-4 mr-2" /> Synchroniser avec email du client</>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={handleEnsureSavingsAccount}
                      className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 mb-4"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Créer un compte d'épargne
                    </Button>

                    <p className="text-xs text-gray-500">
                      User ID: {clientData.user_id.substring(0, 8)}...
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog for linking to existing account */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lier à un compte utilisateur existant</DialogTitle>
            <DialogDescription>
              Entrez l'adresse email du compte utilisateur existant pour le lier à ce client.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                placeholder="exemple@email.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>Annuler</Button>
            <Button 
              onClick={handleLinkToExisting}
              disabled={isSyncingUser || !linkEmail}
            >
              {isSyncingUser ? (
                <><Loader size="sm" className="mr-2" /> Liaison en cours...</>
              ) : (
                <><Link className="h-4 w-4 mr-2" /> Lier le compte</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  CreditCard, 
  PiggyBank, 
  FilePlus, 
  Send, 
  UserCheck, 
  Link, 
  Unlink, 
  Wallet,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { SfdClient } from '@/types/sfdClients';
import { useAccountSynchronization } from '@/hooks/useAccountSynchronization';
import { useClientAccountOperations } from '@/components/admin/hooks/sfd-client/useClientAccountOperations';
import { useClientSavingsAccount } from '@/hooks/useClientSavingsAccount';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientDetailActionsProps {
  client: SfdClient;
  onClientUpdated: () => void;
}

export const ClientDetailActions: React.FC<ClientDetailActionsProps> = ({ 
  client, 
  onClientUpdated 
}) => {
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [isUserLinked, setIsUserLinked] = useState<boolean>(!!client.user_id);
  const [userEmail, setUserEmail] = useState<string>(client.email || '');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { linkClientToUser, isSynchronizing } = useAccountSynchronization();
  const { 
    balance, 
    currency, 
    creditAccount, 
    deleteAccount,
    isLoading: isBalanceLoading,
    refetchBalance
  } = useClientAccountOperations(client.id);
  
  const {
    account,
    createAccount,
    processDeposit,
    isLoading: isSavingsLoading,
    refreshData
  } = useClientSavingsAccount(client.id);

  const handleCreditAccount = async () => {
    if (creditAmount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Le montant doit être supérieur à zéro",
        variant: "destructive",
      });
      return;
    }
    
    await creditAccount.mutateAsync({
      amount: creditAmount,
      description: `Crédit manuel du compte par admin`
    });
    
    setCreditAmount(0);
    refetchBalance();
  };
  
  const handleCreateSavingsAccount = async () => {
    await createAccount(5000); // 5000 FCFA comme solde initial
    refreshData();
  };
  
  const handleDeposit = async () => {
    if (depositAmount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Le montant doit être supérieur à zéro",
        variant: "destructive",
      });
      return;
    }
    
    await processDeposit(depositAmount);
    setDepositAmount(0);
  };
  
  const handleLinkUser = async () => {
    if (!userEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez fournir une adresse email pour lier le compte",
        variant: "destructive",
      });
      return;
    }
    
    const success = await linkClientToUser(client.id, userEmail);
    if (success) {
      setIsUserLinked(true);
      onClientUpdated();
    }
  };
  
  const handleUnlinkUser = async () => {
    try {
      const { error } = await supabase
        .from('sfd_clients')
        .update({ user_id: null })
        .eq('id', client.id);
        
      if (error) throw error;
      
      setIsUserLinked(false);
      onClientUpdated();
      
      toast({
        title: "Compte dissocié",
        description: "Le compte utilisateur a été dissocié de ce client",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible de dissocier le compte: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  const handleNewLoan = () => {
    navigate(`/loans/new?clientId=${client.id}`);
  };
  
  const handleAddDocument = () => {
    navigate(`/clients/${client.id}/documents`);
  };

  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="account" className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          Compte
        </TabsTrigger>
        <TabsTrigger value="financial" className="flex items-center">
          <Wallet className="mr-2 h-4 w-4" />
          Finances
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          Documents
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="account">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations de compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Statut:</span>
                <div className={`px-2 py-1 rounded text-xs ${
                  client.status === 'validated' ? 'bg-green-100 text-green-800' : 
                  client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {client.status === 'validated' ? 'Validé' : 
                   client.status === 'pending' ? 'En attente' : 'Rejeté'}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Niveau KYC:</span>
                <span className="text-sm">{client.kyc_level || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Compte app:</span>
                <span className="text-sm">
                  {isUserLinked ? (
                    <span className="flex items-center text-green-600">
                      <UserCheck className="h-4 w-4 mr-1" />
                      Lié
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Non lié
                    </span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gestion du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isUserLinked ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Email utilisateur</Label>
                    <Input 
                      id="userEmail" 
                      value={userEmail} 
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="email@exemple.com"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleLinkUser} 
                    disabled={isSynchronizing}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Lier à un compte utilisateur
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-200 hover:bg-red-50" 
                  onClick={handleUnlinkUser}
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Dissocier le compte
                </Button>
              )}
              
              {client.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Rejeter
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700" 
                  >
                    Valider
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="financial">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compte Opérationnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Solde actuel:</span>
                <span className="font-bold text-lg">{isBalanceLoading ? '...' : `${balance.toLocaleString()} ${currency}`}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="creditAmount">Montant à créditer</Label>
                <div className="flex gap-2">
                  <Input 
                    id="creditAmount" 
                    type="number"
                    value={creditAmount || ''}
                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                    placeholder="5000"
                  />
                  <Button 
                    onClick={handleCreditAccount}
                    disabled={creditAmount <= 0 || creditAccount.isPending}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Créditer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compte d'Épargne</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!account ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-4">Aucun compte d'épargne</p>
                  <Button onClick={handleCreateSavingsAccount} disabled={isSavingsLoading}>
                    <PiggyBank className="h-4 w-4 mr-2" />
                    Créer un compte d'épargne
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Solde épargne:</span>
                    <span className="font-bold text-lg">{isSavingsLoading ? '...' : `${account.balance.toLocaleString()} ${account.currency}`}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="depositAmount">Montant à déposer</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="depositAmount" 
                        type="number"
                        value={depositAmount || ''}
                        onChange={(e) => setDepositAmount(Number(e.target.value))}
                        placeholder="1000"
                      />
                      <Button 
                        onClick={handleDeposit}
                        disabled={depositAmount <= 0 || isSavingsLoading}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Déposer
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Actions financières</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleNewLoan} className="bg-green-600 hover:bg-green-700">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Nouveau prêt
                </Button>
                
                <Button onClick={handleAddDocument} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Ajouter document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="documents">
        <Card>
          <CardHeader>
            <CardTitle>Documents du client</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAddDocument}>
              <FilePlus className="h-4 w-4 mr-2" />
              Ajouter un document
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ClientDetailActions;

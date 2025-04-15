
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, RefreshCw, Clock, Edit } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useToast } from '@/hooks/use-toast';
import { adaptSfdAccounts, adaptSfdAccount, formatCurrency, getAccountDisplayName } from '@/utils/sfdAdapter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SfdAccountsManager() {
  const { accounts, isLoading, refetchAccounts, synchronizeBalances } = useSfdAccounts();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [newAccountData, setNewAccountData] = useState({
    accountType: '',
    description: '',
    initialBalance: '0',
  });
  
  // Adapt all accounts to ensure they have all required properties
  const adaptedAccounts = adaptSfdAccounts(accounts);
  
  const handleRefreshAccounts = async () => {
    setIsRefreshing(true);
    try {
      await synchronizeBalances.mutate(undefined, {
        onSettled: () => {
          setIsRefreshing(false);
        }
      });
      await refetchAccounts();
      toast({
        title: "Synchronisation terminée",
        description: "Les comptes SFD ont été mis à jour",
      });
    } catch (error) {
      console.error('Error refreshing accounts:', error);
      toast({
        title: "Erreur de synchronisation",
        description: "Une erreur est survenue lors de la mise à jour des comptes",
        variant: "destructive",
      });
      setIsRefreshing(false);
    }
  };
  
  const handleAddAccount = async () => {
    // This would be implemented when the backend is ready
    toast({
      title: "Fonctionnalité en développement",
      description: "L'ajout de comptes sera bientôt disponible",
    });
    setIsAddingAccount(false);
    resetForm();
  };
  
  const handleEditAccount = async () => {
    // This would be implemented when the backend is ready
    toast({
      title: "Fonctionnalité en développement",
      description: "La modification de comptes sera bientôt disponible",
    });
    setIsEditingAccount(false);
    setSelectedAccount(null);
    resetForm();
  };
  
  const resetForm = () => {
    setNewAccountData({
      accountType: '',
      description: '',
      initialBalance: '0',
    });
  };
  
  const handleEditClick = (account: any) => {
    const adaptedAccount = adaptSfdAccount(account);
    setSelectedAccount(adaptedAccount);
    setNewAccountData({
      accountType: adaptedAccount.account_type || '',
      description: adaptedAccount.description || '',
      initialBalance: String(adaptedAccount.balance || 0),
    });
    setIsEditingAccount(true);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3 flex justify-between items-center flex-row">
        <CardTitle className="text-lg">Gestion des comptes SFD</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshAccounts}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader className="mr-2 h-4 w-4" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Actualiser
          </Button>
          <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau compte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau compte</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="account-type">Type de compte</Label>
                  <Select 
                    value={newAccountData.accountType} 
                    onValueChange={(value) => setNewAccountData({...newAccountData, accountType: value})}
                  >
                    <SelectTrigger id="account-type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operation">Opération</SelectItem>
                      <SelectItem value="epargne">Épargne</SelectItem>
                      <SelectItem value="remboursement">Remboursement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    value={newAccountData.description} 
                    onChange={(e) => setNewAccountData({...newAccountData, description: e.target.value})}
                    placeholder="Description du compte"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="balance">Solde initial</Label>
                  <Input 
                    id="balance" 
                    type="number" 
                    min="0" 
                    value={newAccountData.initialBalance} 
                    onChange={(e) => setNewAccountData({...newAccountData, initialBalance: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingAccount(false)}>Annuler</Button>
                <Button onClick={handleAddAccount}>Ajouter le compte</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tous les comptes</TabsTrigger>
            <TabsTrigger value="operation">Opération</TabsTrigger>
            <TabsTrigger value="savings">Épargne</TabsTrigger>
            <TabsTrigger value="repayment">Remboursement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {adaptedAccounts.length > 0 ? (
              adaptedAccounts.map(account => (
                <div key={account.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium">{getAccountDisplayName(account)}</p>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {account.account_type || 'Principal'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {account.id.substring(0, 8)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(account.balance || 0, account.currency || 'FCFA')}</p>
                      <p className="text-xs text-muted-foreground">
                        Dernière activité: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(account)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Aucun compte trouvé</p>
                <Button className="mt-4" onClick={() => setIsAddingAccount(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un compte
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Similar TabsContent for other account types, showing filtered results */}
          <TabsContent value="operation" className="space-y-4">
            {adaptedAccounts
              .filter(account => account.account_type === 'operation')
              .map(account => (
                <div key={account.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{getAccountDisplayName(account)}</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {account.id.substring(0, 8)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(account.balance || 0, account.currency || 'FCFA')}</p>
                      <p className="text-xs text-muted-foreground">
                        Dernière activité: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(account)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </TabsContent>
        </Tabs>
        
        <Dialog open={isEditingAccount} onOpenChange={setIsEditingAccount}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le compte</DialogTitle>
            </DialogHeader>
            {selectedAccount && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-account-type">Type de compte</Label>
                  <Select 
                    value={newAccountData.accountType} 
                    onValueChange={(value) => setNewAccountData({...newAccountData, accountType: value})}
                  >
                    <SelectTrigger id="edit-account-type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operation">Opération</SelectItem>
                      <SelectItem value="epargne">Épargne</SelectItem>
                      <SelectItem value="remboursement">Remboursement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input 
                    id="edit-description" 
                    value={newAccountData.description} 
                    onChange={(e) => setNewAccountData({...newAccountData, description: e.target.value})}
                    placeholder="Description du compte"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-balance">Solde actuel</Label>
                  <Input 
                    id="edit-balance" 
                    type="number" 
                    min="0" 
                    value={newAccountData.initialBalance} 
                    onChange={(e) => setNewAccountData({...newAccountData, initialBalance: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingAccount(false)}>Annuler</Button>
              <Button onClick={handleEditAccount}>Enregistrer les modifications</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

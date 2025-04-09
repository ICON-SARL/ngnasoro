
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, CreditCard, Clock, PlusCircle, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface SfdLoan {
  id: string;
  amount: number;
  remainingAmount?: number;
  nextDueDate?: string;
  next_payment_date?: string;
  isLate?: boolean;
}

interface SfdAccountType {
  id: string;
  name: string;
  logoUrl?: string;
  logo_url?: string;
  region?: string; // Make region optional to match SfdAccount
  code?: string;   // Make code optional to match actual usage
  isDefault: boolean;
  balance: number;
  currency: string;
  isVerified: boolean;
  loans?: SfdLoan[];
}

const adaptSfdAccount = (account: any): SfdAccountType => {
  return {
    id: account.id,
    name: account.name,
    logoUrl: account.logoUrl,
    logo_url: account.logo_url,
    region: account.region || 'Non spécifié',
    code: account.code || '',
    isDefault: account.isDefault || false,
    balance: account.balance || 0,
    currency: account.currency || 'FCFA',
    isVerified: account.isVerified || false,
    loans: account.loans || []
  };
};

export function MultiSfdAccountsView() {
  const { user } = useAuth();
  const { sfdAccounts, activeSfdAccount, isLoading, makeLoanPayment } = useSfdAccounts();
  const { toast } = useToast();
  const [discoverSfdOpen, setDiscoverSfdOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const getLogoUrl = (account: SfdAccountType): string => {
    return account.logoUrl || account.logo_url || '';
  };

  if (!sfdAccounts || sfdAccounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes Comptes SFD</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas encore de compte associé à une SFD.
          </p>
          <Button 
            onClick={() => setDiscoverSfdOpen(true)}
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Découvrir les SFDs
          </Button>
          
          <Dialog open={discoverSfdOpen} onOpenChange={setDiscoverSfdOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Découvrir les SFDs</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-center text-muted-foreground">
                  Fonctionnalité en développement. Vous pourrez bientôt découvrir et demander l'accès à de nouvelles SFDs.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  const adaptedSfdAccounts = sfdAccounts.map(adaptSfdAccount);
  const adaptedActiveSfdAccount = activeSfdAccount ? adaptSfdAccount(activeSfdAccount) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes Comptes SFD</h2>
        <Button 
          variant="outline" 
          onClick={() => setDiscoverSfdOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Ajouter un compte
        </Button>
        
        <Dialog open={discoverSfdOpen} onOpenChange={setDiscoverSfdOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Découvrir les SFDs</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-center text-muted-foreground">
                Fonctionnalité en développement. Vous pourrez bientôt découvrir et demander l'accès à de nouvelles SFDs.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex overflow-x-auto pb-4 space-x-4">
        {adaptedSfdAccounts.map((account: SfdAccountType) => (
          <Card 
            key={account.id} 
            className="min-w-[260px]"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  {getLogoUrl(account) ? (
                    <img src={getLogoUrl(account)} alt={account.name} />
                  ) : (
                    <div className="bg-primary/10 h-full w-full flex items-center justify-center text-primary">
                      {account.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
                <CardTitle className="text-base">{account.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Solde disponible</p>
                  <p className="text-xl font-bold">{account.balance.toLocaleString()} {account.currency}</p>
                </div>
                <div className="flex items-center text-sm">
                  <CreditCard className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {account.loans && account.loans.length > 0 ? `${account.loans.length} prêt(s)` : 'Aucun prêt'}
                  </span>
                  {account.loans && account.loans.some(loan => loan.isLate) && (
                    <Badge variant="destructive" className="ml-2">Échéance proche</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {adaptedActiveSfdAccount && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  {getLogoUrl(adaptedActiveSfdAccount) ? (
                    <img src={getLogoUrl(adaptedActiveSfdAccount)} alt={adaptedActiveSfdAccount.name} />
                  ) : (
                    <div className="bg-primary/10 h-full w-full flex items-center justify-center text-primary">
                      {adaptedActiveSfdAccount.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
                <CardTitle>{adaptedActiveSfdAccount.name}</CardTitle>
              </div>
              <Badge className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">Détails</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="balance">
              <TabsList className="mb-4">
                <TabsTrigger value="balance">
                  <Wallet className="h-4 w-4 mr-2" />
                  Solde
                </TabsTrigger>
                <TabsTrigger value="loans">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Prêts
                </TabsTrigger>
                <TabsTrigger value="transactions">
                  <Clock className="h-4 w-4 mr-2" />
                  Transactions
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="balance">
                <div className="p-6 text-center">
                  <h3 className="text-sm text-muted-foreground">Solde total</h3>
                  <p className="text-3xl font-bold my-2">{adaptedActiveSfdAccount.balance.toLocaleString()} {adaptedActiveSfdAccount.currency}</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button>Dépôt</Button>
                    <Button variant="outline">Retrait</Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="loans">
                <div className="space-y-4">
                  {adaptedActiveSfdAccount.loans && adaptedActiveSfdAccount.loans.length > 0 ? (
                    adaptedActiveSfdAccount.loans.map(loan => (
                      <div key={loan.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">Prêt #{loan.id.substring(0, 8)}</h3>
                          {loan.isLate ? (
                            <Badge variant="destructive">Échéance proche</Badge>
                          ) : (
                            <Badge variant="outline">En cours</Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Montant initial</span>
                            <span>{loan.amount.toLocaleString()} {adaptedActiveSfdAccount.currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Reste à payer</span>
                            <span className="font-medium">{(loan.remainingAmount || loan.amount).toLocaleString()} {adaptedActiveSfdAccount.currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Prochaine échéance</span>
                            <span className={loan.isLate ? "text-red-600 font-medium" : ""}>{loan.nextDueDate || loan.next_payment_date}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Button 
                            className="w-full"
                            onClick={() => {
                              if (makeLoanPayment) {
                                makeLoanPayment.mutate({ 
                                  loanId: loan.id, 
                                  amount: (loan.remainingAmount || loan.amount) / 4
                                });
                              } else {
                                toast({
                                  title: "Erreur",
                                  description: "Fonctionnalité de paiement non disponible",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Effectuer un paiement
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-6 border rounded-lg">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">Aucun prêt actif pour ce compte</p>
                      <Button variant="outline" className="mt-4">
                        Demander un prêt
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="transactions">
                <div className="space-y-2">
                  {[
                    {
                      id: 'tx1',
                      description: 'Dépôt espèces',
                      date: '2023-04-28',
                      amount: 50000,
                      type: 'credit'
                    },
                    {
                      id: 'tx2',
                      description: 'Paiement mensuel prêt',
                      date: '2023-04-25',
                      amount: 25000,
                      type: 'debit'
                    }
                  ].map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-3 border-b">
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">{tx.date}</p>
                      </div>
                      <span className={tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()} {adaptedActiveSfdAccount.currency}
                      </span>
                    </div>
                  ))}
                  
                  <div className="pt-4 text-center">
                    <Button variant="outline">Voir l'historique complet</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MultiSfdAccountsView;

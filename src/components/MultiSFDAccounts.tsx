
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRightLeft, Building, Clock, CreditCard, Wallet, Database, Bell } from 'lucide-react';
import AuthenticationSystem from '@/components/AuthenticationSystem';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const MultiSFDAccounts = () => {
  const { sfdAccounts, activeSfdAccount, isLoading, makeLoanPayment } = useSfdAccounts();
  const { activeSfdId, setActiveSfdId } = useAuth();
  const { toast } = useToast();
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [switchToSFD, setSwitchToSFD] = useState<string | null>(null);
  const [switchVerified, setSwitchVerified] = useState(false);

  const handleSwitchInstitution = (sfdId: string) => {
    setSwitchToSFD(sfdId);
    setSwitchDialogOpen(true);
    setSwitchVerified(false);
  };

  const handleAuthComplete = () => {
    setSwitchVerified(true);
  };

  const finalizeSwitchInstitution = () => {
    if (switchToSFD) {
      setActiveSfdId(switchToSFD);
      setSwitchDialogOpen(false);
      toast({
        title: "SFD changée",
        description: `Vous êtes maintenant connecté à une nouvelle SFD`,
      });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Chargement des données SFD...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes Comptes SFD</h2>
        <Dialog open={switchDialogOpen} onOpenChange={setSwitchDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Changer de SFD
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Changer d'institution SFD</DialogTitle>
            </DialogHeader>
            {!switchVerified ? (
              <div className="space-y-4">
                <div className="bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
                  <AlertCircle className="h-4 w-4 inline-block mr-2" />
                  Pour votre sécurité, une authentification 2FA est requise avant de changer d'institution
                </div>
                <AuthenticationSystem onComplete={handleAuthComplete} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4 text-sm text-green-800">
                  Authentication réussie! Veuillez sélectionner l'institution à laquelle vous souhaitez accéder.
                </div>
                <div className="space-y-2">
                  {sfdAccounts.map(acc => (
                    <div 
                      key={acc.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                        switchToSFD === acc.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSwitchToSFD(acc.id)}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <img src={acc.logoUrl || acc.logo_url || '/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png'} alt={acc.name} />
                      </Avatar>
                      <div>
                        <p className="font-medium">{acc.name}</p>
                        <p className="text-sm text-muted-foreground">Solde: {acc.balance.toLocaleString()} {acc.currency}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button onClick={finalizeSwitchInstitution}>
                    Basculer vers cette SFD
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex overflow-x-auto pb-4 space-x-4">
        {sfdAccounts.map(account => (
          <Card 
            key={account.id} 
            className={`min-w-[260px] cursor-pointer transition-all ${
              activeSfdId === account.id ? 'ring-2 ring-primary' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleSwitchInstitution(account.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <img src={account.logoUrl || account.logo_url || '/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png'} alt={account.name} />
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
                    {account.id === 'sfd2' ? '1 prêt' : '1 prêt'}
                  </span>
                  {account.id === 'sfd2' && (
                    <Badge variant="destructive" className="ml-2">Échéance proche</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {activeSfdAccount && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <img src={activeSfdAccount.logoUrl || activeSfdAccount.logo_url || '/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png'} alt={activeSfdAccount.name} />
                </Avatar>
                <CardTitle>{activeSfdAccount.name}</CardTitle>
              </div>
              <Badge className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">Actif</Badge>
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
                  <Database className="h-4 w-4 mr-2" />
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
                  <p className="text-3xl font-bold my-2">{activeSfdAccount.balance.toLocaleString()} {activeSfdAccount.currency}</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button>Dépôt</Button>
                    <Button variant="outline">Retrait</Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="loans">
                <div className="space-y-4">
                  {activeSfdAccount.loans && activeSfdAccount.loans.map(loan => (
                    <div key={loan.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">Prêt #{loan.id}</h3>
                        {loan.isLate ? (
                          <Badge variant="destructive">Échéance proche</Badge>
                        ) : (
                          <Badge variant="outline">En cours</Badge>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Montant initial</span>
                          <span>{loan.amount.toLocaleString()} {activeSfdAccount.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Reste à payer</span>
                          <span className="font-medium">{(loan.remainingAmount || loan.amount).toLocaleString()} {activeSfdAccount.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Prochaine échéance</span>
                          <span className={loan.isLate ? "text-red-600 font-medium" : ""}>{loan.nextDueDate || loan.next_payment_date}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button 
                          className="w-full"
                          onClick={() => makeLoanPayment.mutate({ 
                            loanId: loan.id, 
                            amount: (loan.remainingAmount || loan.amount) / 4 // Make a quarter payment
                          })}
                        >
                          Effectuer un paiement
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {(!activeSfdAccount.loans || activeSfdAccount.loans.length === 0) && (
                    <div className="text-center p-6 border rounded-lg">
                      <Database className="h-8 w-8 mx-auto mb-2 text-gray-400" />
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
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()} {activeSfdAccount.currency}
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
      
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-800 flex items-center text-base">
            <Bell className="h-4 w-4 mr-2" />
            Notifications en temps réel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700">
            Les notifications push sont activées pour tous vos comptes SFD. Vous serez alerté instantanément pour tout mouvement de fonds.
          </p>
          <div className="flex justify-end mt-2">
            <Button variant="outline" className="text-amber-800 border-amber-300 bg-amber-100 hover:bg-amber-200">
              Gérer les notifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiSFDAccounts;

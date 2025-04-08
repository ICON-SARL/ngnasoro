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
  const { activeSfdId, setActiveSfdId } = useAuth(); // Now this property exists
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
                        <img src={acc.logoUrl || '/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png'} alt={acc.name} />
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
                  <img src={account.logoUrl || '/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png'} alt={account.name} />
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
                  <img src={activeSfdAccount.logoUrl || '/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png'} alt={activeSfdAccount.name} />
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
                          <span className="font-medium">{loan.remainingAmount.toLocaleString()} {activeSfdAccount.currency}</

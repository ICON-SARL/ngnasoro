
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, CreditCard, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SfdAccountType } from '../MultiSfdAccountsView';
import { LoanItemCard } from './';
import { TransactionItem } from './';

interface SfdAccountDetailsProps {
  account: SfdAccountType;
  makeLoanPayment?: any;
}

const SfdAccountDetails = ({ account, makeLoanPayment }: SfdAccountDetailsProps) => {
  const { toast } = useToast();

  const getLogoUrl = (account: SfdAccountType): string => {
    return account.logoUrl || account.logo_url || '';
  };

  const handleLoanPayment = (loanId: string, amount: number) => {
    if (makeLoanPayment) {
      makeLoanPayment.mutate({ loanId, amount });
    } else {
      toast({
        title: "Erreur",
        description: "Fonctionnalité de paiement non disponible",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
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
            <h3 className="text-2xl font-semibold leading-none tracking-tight">{account.name}</h3>
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
              <p className="text-3xl font-bold my-2">{account.balance.toLocaleString()} {account.currency}</p>
              <div className="flex justify-center gap-2 mt-4">
                <Button>Dépôt</Button>
                <Button variant="outline">Retrait</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="loans">
            <div className="space-y-4">
              {account.loans && account.loans.length > 0 ? (
                account.loans.map(loan => (
                  <LoanItemCard 
                    key={loan.id}
                    loan={loan}
                    currency={account.currency}
                    onPaymentClick={() => handleLoanPayment(
                      loan.id, 
                      (loan.remainingAmount || loan.amount) / 4
                    )}
                  />
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
                  type: 'credit' as const
                },
                {
                  id: 'tx2',
                  description: 'Paiement mensuel prêt',
                  date: '2023-04-25',
                  amount: 25000,
                  type: 'debit' as const
                }
              ].map(tx => (
                <TransactionItem 
                  key={tx.id}
                  id={tx.id}
                  description={tx.description}
                  date={tx.date}
                  amount={tx.amount}
                  type={tx.type}
                  currency={account.currency}
                />
              ))}
              
              <div className="pt-4 text-center">
                <Button variant="outline">Voir l'historique complet</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SfdAccountDetails;

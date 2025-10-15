
import React, { useState, useEffect } from 'react';
import { useClientSavingsAccount } from '@/hooks/useClientSavingsAccount';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AccountOperationDialog from './client-accounts/AccountOperationDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Banknote, PiggyBank, RefreshCw } from 'lucide-react';
import { NotificationsOverlay } from '@/components/mobile/NotificationsOverlay';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientSavingsAccountViewProps {
  clientId: string;
  clientName: string;
  sfdId?: string;
}

const ClientSavingsAccountView: React.FC<ClientSavingsAccountViewProps> = ({ clientId, clientName, sfdId }) => {
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  const {
    account,
    isLoading,
    ensureSavingsAccount,
    refreshData
  } = useClientSavingsAccount(clientId);

  // Log component props and account data for debugging
  useEffect(() => {
    console.log('ClientSavingsAccountView props:', { clientId, clientName, sfdId });
    console.log('Current account data:', account);
  }, [clientId, clientName, sfdId, account]);

  const handleCreateAccount = async () => {
    try {
      await ensureSavingsAccount();
      toast({
        title: 'Compte créé',
        description: 'Le compte d\'épargne a été créé avec succès',
      });
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le compte d\'épargne',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      await refreshData();
      
      // Also update accounts table explicitly to ensure we have latest balance
      if (account?.user_id) {
        // Fetch the latest balance from transactions
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('amount, type, created_at')
          .eq('user_id', account.user_id)
          .order('created_at', { ascending: true });
          
        if (txError) throw txError;
        
        // Calculate balance based on transactions
        let calculatedBalance = 0;
        transactions?.forEach(tx => {
          if (tx.type === 'deposit' || tx.type === 'loan_disbursement') {
            calculatedBalance += Math.abs(Number(tx.amount));
          } else if (tx.type === 'withdrawal' || tx.type === 'loan_repayment') {
            calculatedBalance -= Math.abs(Number(tx.amount));
          } else {
            calculatedBalance += Number(tx.amount);
          }
        });
        
        console.log('Calculated balance from transactions:', calculatedBalance);
        console.log('Current account balance:', account.balance);
        
        // If balances don't match, update the account
        if (calculatedBalance !== account.balance) {
          console.log('Updating account balance to match transactions');
          const { error: updateError } = await supabase.functions.invoke('client-accounts', {
            body: {
              action: 'updateBalance',
              clientId,
              amount: calculatedBalance - account.balance,
              description: 'Correction de solde automatique',
            }
          });
          
          if (updateError) throw updateError;
          
          toast({
            title: 'Solde mis à jour',
            description: 'Le solde a été recalculé et mis à jour',
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing account:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rafraîchir les données du compte',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D6A51]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Compte d'épargne</CardTitle>
          <CardDescription>
            {account ? 'Gestion du compte épargne client' : 'Le client n\'a pas encore de compte d\'épargne'}
          </CardDescription>
        </div>
        {account && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <div className="animate-spin h-4 w-4 border-b-2 border-[#0D6A51] rounded-full"/>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {account ? (
          <div className="space-y-4">
            <div className="rounded-md bg-[#F8F9FC] p-4">
              <div className="mb-2 text-sm font-medium">Solde actuel</div>
              <div className="text-2xl font-semibold text-[#0D6A51]">
                {account.balance.toLocaleString('fr-FR')} {account.currency || 'FCFA'}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Dernière mise à jour: {format(new Date(account?.updated_at || Date.now()), 'PPP', { locale: fr })}
              </div>
            </div>

            <Button 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => setIsOperationDialogOpen(true)}
            >
              <Banknote className="mr-2 h-4 w-4" />
              Effectuer une opération
            </Button>

            <AccountOperationDialog 
              isOpen={isOperationDialogOpen}
              onClose={() => setIsOperationDialogOpen(false)}
              clientId={clientId}
              clientName={clientName}
              onOperationComplete={() => {
                refreshData();
                toast({
                  title: 'Opération réussie',
                  description: 'Le compte client a été mis à jour avec succès',
                });
              }}
            />
          </div>
        ) : (
          <div className="text-center py-6">
            <Button 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={handleCreateAccount}
            >
              <PiggyBank className="mr-2 h-4 w-4" />
              Créer un compte d'épargne
            </Button>
          </div>
        )}
      </CardContent>

      {/* Composant de notifications pour afficher les notifications en temps réel */}
      <NotificationsOverlay />
    </Card>
  );
};

export default ClientSavingsAccountView;

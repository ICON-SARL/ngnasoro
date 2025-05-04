
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';
import { useTransactions } from '@/hooks/transactions';
import FundsBalanceSection from '@/components/mobile/funds-management/FundsBalanceSection';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';

const MobileWithdrawPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const { accounts, isLoading } = useSfdAccounts();
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { makeWithdrawal, getBalance } = useTransactions(user?.id, activeSfdId);
  const [balance, setBalance] = useState<number>(0);
  const [selectedSfd, setSelectedSfd] = useState<string>(activeSfdId || 'all');
  
  React.useEffect(() => {
    const loadBalance = async () => {
      if (user?.id && activeSfdId) {
        try {
          const currentBalance = await getBalance();
          setBalance(currentBalance);
        } catch (error) {
          console.error('Failed to load balance:', error);
        }
      }
    };
    
    loadBalance();
  }, [user?.id, activeSfdId, getBalance]);

  const handleWithdraw = async () => {
    if (!user?.id || !activeSfdId) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour effectuer un retrait',
        variant: 'destructive',
      });
      return;
    }

    if (amount <= 0) {
      toast({
        title: 'Erreur',
        description: 'Le montant doit être supérieur à 0',
        variant: 'destructive',
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: 'Erreur',
        description: 'Solde insuffisant pour ce retrait',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const transaction = await makeWithdrawal(amount, description || 'Retrait mobile');
      
      if (transaction) {
        toast({
          title: 'Retrait effectué',
          description: `Vous avez retiré ${formatCurrency(amount)} FCFA de votre compte`,
          variant: 'default',
        });
        navigate('/mobile-flow/savings');
      } else {
        toast({
          title: 'Erreur',
          description: 'Le retrait a échoué, veuillez réessayer',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors du retrait',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/savings')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Retrait</h1>
      </div>
      
      <div className="p-4">
        <FundsBalanceSection 
          balance={balance}
          isRefreshing={isLoading}
          sfdAccounts={accounts}
          onSelectSfd={(sfdId) => setSelectedSfd(sfdId)}
          selectedSfd={selectedSfd}
        />
        
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant à retirer (FCFA)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="0"
                  className="text-lg"
                />
                {amount > balance && (
                  <p className="text-sm text-red-500">Solde insuffisant pour ce retrait</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Motif du retrait"
                />
              </div>
              
              <Button 
                className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mt-4" 
                onClick={handleWithdraw}
                disabled={isSubmitting || amount <= 0 || amount > balance}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Traitement...
                  </span>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" /> 
                    Effectuer le retrait
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileWithdrawPage;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '@/hooks/transactions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import FundsHeader from '@/components/funds/FundsHeader';
import FundsBalanceSection from '@/components/funds/FundsBalanceSection';
import TransferOptions from '@/components/funds/TransferOptions';
import MobileMoneyDialog from '@/components/funds/MobileMoneyDialog';

const FundsPage = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  
  const { 
    getBalance,
    refetch,
    isLoading 
  } = useTransactions(user?.id, activeSfdId);

  useRealtimeSync({
    table: 'transactions',
    filter: user?.id ? `user_id=eq.${user.id}` : undefined,
    onInsert: () => {
      refetch();
      toast({
        title: "Nouvelle transaction",
        description: "Votre solde a été mis à jour",
      });
    }
  });

  // Fetch balance when component mounts or dependencies change
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await getBalance();
        setCurrentBalance(balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer le solde",
          variant: "destructive",
        });
      }
    };

    fetchBalance();
  }, [getBalance, toast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      const balance = await getBalance();
      setCurrentBalance(balance);
      toast({
        title: "Mise à jour",
        description: "Données actualisées avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les données",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBack = () => navigate('/mobile-flow/main');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <FundsHeader 
        onBack={handleBack}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || isLoading}
      />

      <FundsBalanceSection 
        balance={currentBalance}
        isRefreshing={isRefreshing || isLoading}
      />

      <div className="p-4 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Actions rapides</h2>
        <TransferOptions 
          onDeposit={() => setShowDepositDialog(true)}
          onWithdraw={() => setShowWithdrawDialog(true)}
        />
      </div>

      <MobileMoneyDialog 
        open={showDepositDialog}
        onClose={() => setShowDepositDialog(false)}
        isWithdrawal={false}
      />

      <MobileMoneyDialog 
        open={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        isWithdrawal={true}
      />
    </div>
  );
};

export default FundsPage;

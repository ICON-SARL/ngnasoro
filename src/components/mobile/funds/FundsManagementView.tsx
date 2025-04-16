import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Wallet, ArrowUpDown, RefreshCw } from 'lucide-react';
import MobileMoneyModal from '../loan/MobileMoneyModal';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useTransactions } from '@/hooks/transactions';
import { useAuth } from '@/hooks/useAuth';
import EmptySfdState from '../EmptySfdState';

const FundsManagementView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const { getActiveSfdData } = useSfdDataAccess();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const { user } = useAuth();

  const { getBalance, fetchTransactions, transactions } = useTransactions(
    user?.id || null,
    activeSfdId
  );

  useEffect(() => {
    const loadSfdData = async () => {
      try {
        const sfdData = await getActiveSfdData();
        if (!sfdData) {
          navigate('/mobile-flow/empty-sfd');
          return;
        }
        setActiveSfdId(sfdData.id);
      } catch (error) {
        console.error("Error loading SFD data:", error);
      }
    };
    
    loadSfdData();
  }, [getActiveSfdData, navigate]);

  useEffect(() => {
    if (activeSfdId && user?.id) {
      fetchBalanceData();
    }
  }, [activeSfdId, user?.id]);

  const fetchBalanceData = async () => {
    if (!activeSfdId || !user?.id) return;
    
    setIsLoading(true);
    try {
      const currentBalance = await getBalance();
      setBalance(currentBalance);
      
      await fetchTransactions();
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer votre solde. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/mobile-flow/main');
  };

  const handleRefresh = () => {
    fetchBalanceData();
    toast({
      title: "Actualisation",
      description: "Actualisation des données en cours...",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0D6A51] text-white p-4">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="text-white hover:bg-white/10 mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Mes fonds</h1>
        </div>
        
        <Card className="bg-[#0D6A51]/20 text-white border-0">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm opacity-90">Solde disponible</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-6 w-6 text-white hover:bg-white/10"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="text-2xl font-bold mb-4">
              {isLoading ? '...' : `${balance.toLocaleString('fr-FR')} FCFA`}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Actions rapides</h2>
        
        <Card className="border hover:border-primary cursor-pointer" onClick={() => setShowDepositModal(true)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Dépôt Mobile Money</h3>
                  <p className="text-xs text-gray-500">Déposez via votre compte mobile money</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:border-primary cursor-pointer" onClick={() => setShowWithdrawModal(true)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <ArrowUpDown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Retrait Mobile Money</h3>
                  <p className="text-xs text-gray-500">Retirez via votre compte mobile money</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {transactions && transactions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Transactions récentes</h2>
            <Card className="border">
              <CardContent className="p-4">
                <ul className="space-y-3">
                  {transactions.slice(0, 3).map((tx) => (
                    <li key={tx.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{tx.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('fr-FR')} FCFA
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <MobileMoneyModal 
          onClose={() => {
            setShowDepositModal(false);
            fetchBalanceData();
          }}
          isWithdrawal={false}
        />
      </Dialog>

      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <MobileMoneyModal 
          onClose={() => {
            setShowWithdrawModal(false);
            fetchBalanceData();
          }}
          isWithdrawal={true}
        />
      </Dialog>
    </div>
  );
};

export default FundsManagementView;

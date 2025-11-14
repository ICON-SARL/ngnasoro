import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Wallet, PiggyBank, CreditCard, TrendingUp, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['user-accounts-page', user?.id, activeSfdId],
    queryFn: async () => {
      if (!user?.id || !activeSfdId) return [];
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('sfd_id', activeSfdId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!activeSfdId
  });

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getAccountIcon = (currency: string) => {
    switch (currency) {
      case 'FCFA': return Wallet;
      case 'USD': return CreditCard;
      default: return PiggyBank;
    }
  };

  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 pb-8">
          <Skeleton className="w-8 h-8 rounded-full mb-4" />
          <Skeleton className="w-40 h-8 mb-2" />
          <Skeleton className="w-32 h-4" />
        </div>
        <div className="px-4 -mt-4 space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 pb-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Mes Comptes</h1>
        <p className="text-sm opacity-90">
          Gérez tous vos comptes en un seul endroit
        </p>
      </div>

      {/* Total balance card */}
      <div className="px-4 -mt-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm opacity-90">Solde total</span>
          </div>
          <h2 className="text-4xl font-bold mb-6">{formatBalance(totalBalance)} FCFA</h2>
          
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/mobile-flow/funds-management?action=deposit')}
              className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0 rounded-2xl"
            >
              <ArrowDownToLine className="w-4 h-4 mr-2" />
              Recharger
            </Button>
            <Button
              onClick={() => navigate('/mobile-flow/funds-management?action=withdraw')}
              variant="outline"
              className="flex-1 bg-transparent hover:bg-white/10 text-white border-white/30 rounded-2xl"
            >
              <ArrowUpFromLine className="w-4 h-4 mr-2" />
              Retirer
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Accounts list */}
      <div className="px-4 space-y-3">
        <h2 className="font-semibold mb-3">Comptes individuels</h2>
        {accounts && accounts.length > 0 ? (
          accounts.map((account, index) => {
            const Icon = getAccountIcon(account.currency || 'FCFA');
            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-card rounded-3xl p-5 border border-border shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      Compte {account.currency}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {account.status === 'active' ? 'Actif' : account.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatBalance(account.balance || 0)}</p>
                    <p className="text-xs text-muted-foreground">{account.currency}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => navigate(`/mobile-flow/transactions?account=${account.id}`)}
                  >
                    Historique
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-xl"
                    onClick={() => navigate('/mobile-flow/funds-management')}
                  >
                    Opération
                  </Button>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="bg-muted/50 rounded-3xl p-8 text-center">
            <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun compte disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsPage;

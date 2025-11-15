import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Wallet, PiggyBank, CreditCard, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();

  const { data: sfdAccounts, isLoading } = useQuery({
    queryKey: ['user-sfd-accounts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Récupérer tous les SFD auxquels l'utilisateur est associé
      const { data: userSfds, error: sfdError } = await supabase
        .from('user_sfds')
        .select(`
          sfd_id,
          sfds (
            id,
            name,
            code,
            logo_url,
            region
          )
        `)
        .eq('user_id', user.id);
      
      if (sfdError) throw sfdError;
      
      // Pour chaque SFD, récupérer les comptes
      const allAccounts = [];
      for (const userSfd of userSfds || []) {
        const { data: accounts } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('sfd_id', userSfd.sfd_id);
        
        if (accounts && accounts.length > 0) {
          allAccounts.push({
            sfd: userSfd.sfds,
            accounts: accounts
          });
        }
      }
      
      return allAccounts;
    },
    enabled: !!user?.id
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

  const totalBalance = sfdAccounts?.reduce((sum, sfdGroup) => 
    sum + sfdGroup.accounts.reduce((accSum, acc) => accSum + (acc.balance || 0), 0), 0
  ) || 0;

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
          className="bg-gradient-to-br from-[#fcb041] via-[#fdc158] to-[#fcb041]/90 rounded-3xl p-6 text-white shadow-xl"
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

    </div>
  );
};

export default AccountsPage;

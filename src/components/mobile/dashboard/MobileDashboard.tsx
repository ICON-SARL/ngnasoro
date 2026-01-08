import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import EmptyAccountState from '../EmptyAccountState';
import DashboardHeader from './DashboardHeader';
import AccountBalanceCard from './AccountBalanceCard';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';

const MobileDashboard: React.FC = () => {
  const { user, activeSfdId } = useAuth();

  // Récupérer le profil utilisateur
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['client-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Récupérer les comptes utilisateur
  const { data: userAccounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['user-accounts', user?.id, activeSfdId],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('sfd_id', activeSfdId || '');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!activeSfdId
  });

  // Récupérer les informations SFD
  const { data: sfdInfo } = useQuery({
    queryKey: ['sfd-info', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return null;
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('id', activeSfdId)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!activeSfdId
  });

  // Récupérer les transactions récentes
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['recent-transactions', user?.id, activeSfdId],
    queryFn: async () => {
      if (!user?.id || !activeSfdId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!activeSfdId
  });

  const isLoading = profileLoading || accountsLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4 space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!activeSfdId) {
    return <EmptyAccountState />;
  }

  const totalBalance = (userAccounts || []).reduce((sum, acc) => sum + (acc.balance || 0), 0);

  const displayAccounts = [
    ...(userAccounts || []).map(acc => ({
      id: acc.id,
      sfd_id: acc.sfd_id,
      name: 'Compte Principal',
      description: 'Votre compte personnel',
      balance: acc.balance || 0,
      currency: acc.currency || 'FCFA',
      account_type: 'operation' as const,
      status: acc.status || 'active',
      created_at: acc.created_at || new Date().toISOString(),
      updated_at: acc.updated_at || new Date().toISOString(),
      logo_url: sfdInfo?.logo_url,
      logoUrl: sfdInfo?.logo_url,
      code: sfdInfo?.code || '',
      region: sfdInfo?.region || '',
      isDefault: true,
      is_default: true
    }))
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-20"
    >
      <DashboardHeader 
        userName={profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
        avatarUrl={profile?.avatar_url}
      />

      <div className="px-4 space-y-6 pb-6">
        <AccountBalanceCard 
          balance={totalBalance}
          currency="FCFA"
          accounts={displayAccounts}
        />
        <QuickActions />
        <RecentTransactions
          transactions={transactions || []}
          isLoading={transactionsLoading}
        />
      </div>
    </motion.div>
  );
};

export default MobileDashboard;

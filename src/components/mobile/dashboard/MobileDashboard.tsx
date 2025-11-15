import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyAccountState from '../EmptyAccountState';
import DashboardHeader from './DashboardHeader';
import AccountBalanceCard from './AccountBalanceCard';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';
import VaultSection from './VaultSection';
import { AlertCircle } from 'lucide-react';

const MobileDashboard: React.FC = () => {
  const { user, activeSfdId } = useAuth();

  console.log('📊 MobileDashboard - Loading data for user:', {
    userId: user?.id,
    activeSfdId,
    userEmail: user?.email
  });

  // Récupérer le profil utilisateur complet
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['client-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('🔍 Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('❌ Profile fetch error:', error);
        throw error;
      }
      console.log('✅ Profile loaded:', data);
      return data;
    },
    enabled: !!user?.id
  });

  // Récupérer les comptes personnels de l'utilisateur (pas les comptes SFD)
  const { data: userAccounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['user-accounts', user?.id, activeSfdId],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('🔍 Fetching user accounts');
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('sfd_id', activeSfdId || '');
      
      if (error) {
        console.error('❌ Accounts fetch error:', error);
        throw error;
      }
      console.log('✅ User accounts loaded:', data);
      return data || [];
    },
    enabled: !!user?.id && !!activeSfdId
  });

  // Récupérer les informations SFD
  const { data: sfdInfo } = useQuery({
    queryKey: ['sfd-info', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return null;
      console.log('🔍 Fetching SFD info');
      
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('id', activeSfdId)
        .single();
      
      if (error) {
        console.error('❌ SFD fetch error:', error);
        return null;
      }
      console.log('✅ SFD info loaded:', data);
      return data;
    },
    enabled: !!activeSfdId
  });

  // Récupérer les comptes SFD pour afficher les détails
  const { data: sfdAccounts } = useQuery({
    queryKey: ['sfd-accounts-detail', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      console.log('🔍 Fetching SFD accounts');
      
      const { data, error } = await supabase
        .from('sfd_accounts')
        .select('*')
        .eq('sfd_id', activeSfdId);
      
      if (error) {
        console.error('❌ SFD accounts fetch error:', error);
        return [];
      }
      console.log('✅ SFD accounts loaded:', data);
      return data || [];
    },
    enabled: !!activeSfdId
  });

  // Récupérer les transactions récentes
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['recent-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('🔍 Fetching transactions');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('❌ Transactions fetch error:', error);
        throw error;
      }
      console.log('✅ Transactions loaded:', data);
      return data || [];
    },
    enabled: !!user?.id
  });

  const isLoading = profileLoading || accountsLoading || transactionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  // Si aucun SFD associé
  if (!activeSfdId) {
    return <EmptyAccountState />;
  }

  // Calculer le solde total des comptes personnels
  const totalBalance = (userAccounts || []).reduce((sum, acc) => sum + (acc.balance || 0), 0);

  // Préparer les comptes pour l'affichage - version simplifiée
  const displayAccounts = [
    ...(userAccounts || []).map(acc => ({
      id: acc.id,
      sfd_id: acc.sfd_id,
      name: 'Compte Principal',
      description: 'Votre compte personnel',
      balance: acc.balance || 0,
      currency: acc.currency || 'FCFA',
      account_type: 'operation' as const, // Cast pour le type
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

  console.log('📊 Dashboard final data:', {
    totalBalance,
    userAccountsCount: userAccounts?.length || 0,
    sfdAccountsCount: sfdAccounts?.length || 0,
    transactionsCount: transactions?.length || 0,
    displayAccountsCount: displayAccounts.length,
    profile: profile?.full_name,
    sfdName: sfdInfo?.name
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header avec avatar et nom */}
      <DashboardHeader 
        userName={profile?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
        avatarUrl={profile?.avatar_url}
      />

      <div className="px-4 space-y-6 pb-6">
        {/* Carte de solde principal avec animation */}
        <AccountBalanceCard 
          balance={totalBalance}
          currency="FCFA"
          accounts={displayAccounts}
        />

        {/* Actions rapides */}
        <QuickActions />

        {/* Section Tontine */}
        <VaultSection />

        {/* Liste des transactions récentes */}
        <RecentTransactions 
          transactions={transactions || []}
          isLoading={transactionsLoading}
        />
      </div>
    </div>
  );
};

export default MobileDashboard;

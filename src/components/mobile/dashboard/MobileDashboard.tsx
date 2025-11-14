import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyAccountState from '../EmptyAccountState';
import DashboardHeader from './DashboardHeader';
import AccountBalanceCard from './AccountBalanceCard';
import QuickActions from './QuickActions';
import RecentTransactions from './RecentTransactions';
import KycProgressCard from './KycProgressCard';
import { AlertCircle } from 'lucide-react';

const MobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: accounts, isLoading: accountsLoading, error: accountsError } = useSfdAccounts();

  // Récupérer le profil utilisateur pour KYC
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Récupérer les transactions récentes
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['recent-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  if (accountsLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (accountsError) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-sm text-muted-foreground">
            Impossible de charger vos comptes. Veuillez réessayer.
          </p>
        </div>
      </div>
    );
  }

  // Si aucun compte, afficher l'état vide
  if (!accounts || accounts.length === 0) {
    return <EmptyAccountState />;
  }

  // Calculer le solde total
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header avec avatar et nom */}
      <DashboardHeader 
        userName={profile?.full_name || 'Utilisateur'}
        avatarUrl={profile?.avatar_url}
      />

      <div className="px-4 space-y-4 pb-6">
        {/* Carte de solde principal avec animation */}
        <AccountBalanceCard 
          balance={totalBalance}
          currency="FCFA"
          accounts={accounts}
        />

        {/* État du KYC avec progression */}
        <KycProgressCard 
          kycLevel={profile?.kyc_level || 1}
          clientCode={profile?.client_code}
        />

        {/* Actions rapides */}
        <QuickActions />

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

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, TrendingUp, Calendar, Crown, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const CollaborativeVaultDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { vaultId } = useParams<{ vaultId: string }>();
  const { user } = useAuth();

  const { data: vault, isLoading } = useQuery({
    queryKey: ['collaborative-vault', vaultId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborative_vaults')
        .select(`
          *,
          collaborative_vault_members(
            id,
            user_id,
            status,
            total_contributed,
            is_admin,
            joined_at
          ),
          collaborative_vault_transactions(
            id,
            transaction_type,
            amount,
            created_at,
            description,
            user_id
          )
        `)
        .eq('id', vaultId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!vaultId
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Coffre non trouvé</p>
          <Button onClick={() => navigate(-1)}>Retour</Button>
        </div>
      </div>
    );
  }

  const progress = (vault.current_amount / vault.target_amount) * 100;
  const isCreator = vault.creator_id === user?.id;
  const members = vault.collaborative_vault_members || [];
  const transactions = vault.collaborative_vault_transactions || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-pink-600 text-white p-6 pb-8">
        <button onClick={() => navigate(-1)} className="mb-4 p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{vault.name}</h1>
            {vault.description && (
              <p className="text-sm opacity-90">{vault.description}</p>
            )}
          </div>
          {isCreator && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Créateur
            </span>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-6 border border-border"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Montant actuel</p>
              <p className="text-3xl font-bold text-foreground">
                {formatAmount(vault.current_amount)} <span className="text-base text-muted-foreground">FCFA</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Objectif</p>
              <p className="text-xl font-semibold text-muted-foreground">
                {formatAmount(vault.target_amount)} FCFA
              </p>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Progression
              </span>
              <span className="font-semibold text-foreground">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-pink-600 transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {vault.deadline && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Date limite : {formatDate(vault.deadline)}</span>
            </div>
          )}
        </motion.div>

        {/* Members Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-6 border border-border"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Membres ({members.length})
            </h2>
            {isCreator && (
              <Button size="sm" variant="outline" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Inviter
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {members.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-muted rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.user_id?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Membre {member.user_id === user?.id ? '(Vous)' : ''}
                    </p>
                    {member.is_admin && (
                      <span className="text-xs text-muted-foreground">Administrateur</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {formatAmount(member.total_contributed)} FCFA
                  </p>
                  <p className="text-xs text-muted-foreground">Contributions</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Transactions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl p-6 border border-border"
        >
          <h2 className="font-semibold mb-4 text-foreground">Activités récentes</h2>

          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-2xl">
                  <div>
                    <p className="font-medium text-foreground">
                      {transaction.transaction_type === 'deposit' ? 'Dépôt' : 'Retrait'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                  <p className={`font-semibold ${transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatAmount(transaction.amount)} FCFA
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune activité</p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 h-12">
            Déposer
          </Button>
          <Button variant="outline" className="h-12">
            Retirer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeVaultDetailsPage;

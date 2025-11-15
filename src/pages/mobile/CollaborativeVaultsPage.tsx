import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, Plus, Crown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const CollaborativeVaultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'my_vaults' | 'invited' | 'public'>('my_vaults');

  const { data: vaults, isLoading } = useQuery({
    queryKey: ['collaborative-vaults', user?.id, filter],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('collaborative_vaults')
        .select(`
          *,
          collaborative_vault_members!inner(user_id, status, total_contributed, is_admin)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'my_vaults') {
        query = query.eq('creator_id', user.id);
      } else if (filter === 'invited') {
        query = query.eq('collaborative_vault_members.user_id', user.id)
                     .neq('creator_id', user.id);
      } else if (filter === 'public') {
        query = query.eq('visibility', 'public');
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-pink-600 text-white p-6 pb-8">
        <button onClick={() => navigate(-1)} className="mb-4 p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Coffres Collaboratifs</h1>
        <p className="text-sm opacity-90">Épargnez ensemble pour des objectifs communs</p>
      </div>

      {/* Filters */}
      <div className="px-4 -mt-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { key: 'my_vaults', label: 'Mes Coffres' },
            { key: 'invited', label: 'Invitations' },
            { key: 'public', label: 'Publics' }
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setFilter(status.key as any)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === status.key
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card text-muted-foreground border border-border hover:bg-accent'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Vaults List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : vaults && vaults.length > 0 ? (
          <div className="space-y-3">
            {vaults.map((vault: any) => {
              const progress = (vault.current_amount / vault.target_amount) * 100;
              const isCreator = vault.creator_id === user?.id;
              const memberCount = Array.isArray(vault.collaborative_vault_members) 
                ? vault.collaborative_vault_members.length 
                : 0;
              
              return (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate(`/mobile-flow/collaborative-vault/${vault.id}`)}
                  className="bg-card rounded-3xl p-5 cursor-pointer hover:shadow-lg transition-all border border-border"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{vault.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {memberCount} membre{memberCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {isCreator && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Créateur
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Progression
                      </span>
                      <span className="font-semibold text-foreground">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-600 transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-muted-foreground">Montant actuel</p>
                      <p className="text-lg font-bold text-foreground">
                        {formatAmount(vault.current_amount)} FCFA
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Objectif</p>
                      <p className="text-sm font-semibold text-muted-foreground">
                        {formatAmount(vault.target_amount)} FCFA
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              {filter === 'my_vaults' ? 'Aucun coffre créé' : 
               filter === 'invited' ? 'Aucune invitation' : 
               'Aucun coffre public'}
            </p>
            <Button 
              onClick={() => navigate('/mobile-flow/create-collaborative-vault')}
              className="bg-gradient-to-r from-orange-500 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un coffre
            </Button>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => navigate('/mobile-flow/create-collaborative-vault')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default CollaborativeVaultsPage;

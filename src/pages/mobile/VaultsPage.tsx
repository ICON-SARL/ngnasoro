import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Vault, Plus, Target, Calendar, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const VaultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'goal_reached'>('all');

  const { data: vaults, isLoading } = useQuery({
    queryKey: ['vaults', user?.id, activeSfdId, filter],
    queryFn: async () => {
      if (!user?.id || !activeSfdId) return [];
      
      let query = supabase
        .from('vaults' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!activeSfdId
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      simple: 'Simple',
      locked: 'Verrouillé',
      project: 'Projet'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      goal_reached: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      locked: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[status] || colors.active;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Mes Coffres d'Épargne</h1>
        <p className="text-sm opacity-90">
          Gérez vos objectifs d'épargne
        </p>
      </div>

      <div className="px-4 -mt-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {['all', 'active', 'goal_reached'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground border border-border'
              }`}
            >
              {status === 'all' ? 'Tous' : status === 'active' ? 'Actifs' : 'Objectifs atteints'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : vaults && vaults.length > 0 ? (
          <div className="space-y-3">
            {vaults.map((vault: any) => {
              const progress = vault.target_amount > 0 
                ? (Number(vault.current_amount) / Number(vault.target_amount)) * 100 
                : 0;
              
              return (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/mobile-flow/vault/${vault.id}`)}
                  className="bg-card rounded-3xl p-5 border border-border shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Vault className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{vault.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(vault.status)}`}>
                            {getTypeLabel(vault.type)}
                          </span>
                          {vault.type === 'locked' && vault.deadline && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              {new Date(vault.deadline).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {vault.status === 'goal_reached' && (
                      <Target className="w-5 h-5 text-green-500" />
                    )}
                  </div>

                  {vault.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {vault.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-semibold text-foreground">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatAmount(Number(vault.current_amount))} FCFA
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {formatAmount(Number(vault.target_amount))} FCFA
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Vault className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Aucun coffre trouvé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre premier coffre d'épargne
            </p>
            <Button
              onClick={() => navigate('/mobile-flow/create-vault')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un coffre
            </Button>
          </div>
        )}
      </div>

      <div className="fixed bottom-20 right-4">
        <Button
          onClick={() => navigate('/mobile-flow/create-vault')}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default VaultsPage;
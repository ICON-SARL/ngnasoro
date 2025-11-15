import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Vault, TrendingUp, Plus, ArrowRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const VaultSection: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();

  const { data: vaults, isLoading } = useQuery({
    queryKey: ['user-vaults', user?.id, activeSfdId],
    queryFn: async () => {
      if (!user?.id || !activeSfdId) return [];
      
      const { data, error } = await supabase
        .from('vaults' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('sfd_id', activeSfdId)
        .in('status', ['active', 'locked', 'goal_reached'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!activeSfdId
  });

  const totalSaved = vaults?.reduce((sum, v: any) => sum + (Number(v.current_amount) || 0), 0) || 0;
  const totalTarget = vaults?.reduce((sum, v: any) => sum + (Number(v.target_amount) || 0), 0) || 0;
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (vault: any) => {
    if (vault.status === 'goal_reached') {
      return <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">🎯 Objectif atteint</span>;
    }
    if (vault.type === 'locked') {
      return <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">🔒 Verrouillé</span>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Mes Coffres</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/mobile-flow/vaults')}
          className="text-primary"
        >
          Voir tout
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {vaults && vaults.length > 0 ? (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Vault className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Total épargné</p>
                <p className="text-2xl font-bold">{formatAmount(totalSaved)} FCFA</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-90">Objectif global</span>
                <span className="font-semibold">{overallProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(overallProgress, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm mt-3">
              <Target className="w-4 h-4" />
              <span>{vaults.length} coffre{vaults.length > 1 ? 's' : ''} actif{vaults.length > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {vaults.slice(0, 2).map((vault: any) => {
              const progress = vault.target_amount > 0 
                ? (Number(vault.current_amount) / Number(vault.target_amount)) * 100 
                : 0;
              
              return (
                <motion.div
                  key={vault.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/mobile-flow/vault/${vault.id}`)}
                  className="bg-card rounded-2xl p-4 border border-border shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Vault className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-1">{vault.name}</h3>
                  {getStatusBadge(vault)}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{progress.toFixed(0)}%</span>
                      <span>{formatAmount(Number(vault.target_amount))} FCFA</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-primary mt-2">
                    {formatAmount(Number(vault.current_amount))} FCFA
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-3xl p-6 text-center border border-purple-200/50 dark:border-purple-800/50">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
            <Vault className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Créez votre premier Coffre</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Épargnez pour vos objectifs avec des coffres sécurisés
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => navigate('/mobile-flow/create-vault')}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un coffre
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VaultSection;
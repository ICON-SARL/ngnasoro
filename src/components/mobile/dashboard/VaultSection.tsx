import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Vault, Plus, ArrowRight, Target } from 'lucide-react';
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
        <div className="h-32 bg-muted rounded-2xl animate-pulse" />
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
        <h2 className="text-lg font-semibold text-foreground">Mes Coffres Individuels</h2>
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
          {/* Summary Card */}
          <div className="bg-card rounded-2xl p-5 border border-primary/20 shadow-soft-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Vault className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total épargné</p>
                <p className="text-2xl font-bold text-foreground">{formatAmount(totalSaved)} FCFA</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Objectif global</span>
                <span className="font-semibold text-foreground">{overallProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(overallProgress, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm mt-3 text-muted-foreground">
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
                  className="bg-card rounded-2xl p-4 border border-border/50 shadow-soft-sm"
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
        <div className="bg-muted/30 border border-border/50 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Vault className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Créez votre premier coffre</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Épargnez pour vos objectifs avec des coffres sécurisés
          </p>
          <Button
            onClick={() => navigate('/mobile-flow/create-vault')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau coffre individuel
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default VaultSection;
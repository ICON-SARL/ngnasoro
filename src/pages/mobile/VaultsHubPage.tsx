import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const VaultsHubPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trigger } = useHapticFeedback();

  // Fetch personal vaults stats
  const { data: personalStats } = useQuery({
    queryKey: ['personal-vaults-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0, total: 0 };
      
      const { data, error } = await supabase
        .from('vaults' as any)
        .select('current_amount')
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if (error) throw error;
      
      return {
        count: data?.length || 0,
        total: data?.reduce((sum: number, v: any) => sum + (v.current_amount || 0), 0) || 0
      };
    },
    enabled: !!user?.id
  });

  // Fetch collaborative vaults stats
  const { data: collabStats } = useQuery({
    queryKey: ['collab-vaults-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { count: 0, members: 0 };
      
      const { data, error } = await supabase
        .from('collaborative_vault_members')
        .select(`
          vault_id,
          collaborative_vaults!inner(
            id,
            status,
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('collaborative_vaults.status', 'active');
      
      if (error) throw error;
      
      // Get total members across all vaults
      const vaultIds = data?.map(m => m.vault_id) || [];
      let totalMembers = 0;
      
      if (vaultIds.length > 0) {
        const { data: membersData } = await supabase
          .from('collaborative_vault_members')
          .select('vault_id', { count: 'exact' })
          .in('vault_id', vaultIds)
          .eq('status', 'active');
        
        totalMembers = membersData?.length || 0;
      }
      
      return {
        count: data?.length || 0,
        members: totalMembers
      };
    },
    enabled: !!user?.id
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleNavigate = (path: string) => {
    trigger('light');
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/90 to-background">
      {/* Content */}
      <div className="px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => handleNavigate('/mobile-flow/dashboard')}
            className="mb-4 p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Mes Coffres</h1>
          <p className="text-white/70 text-sm mt-1">Gérez votre épargne</p>
        </motion.div>

        {/* Cards Container */}
        <div className="space-y-4 max-w-md mx-auto">
          {/* Individual Vaults Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigate('/mobile-flow/vaults')}
            className="bg-card rounded-2xl p-5 shadow-soft-md border border-border/50 cursor-pointer"
          >
            {/* Icon + Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">Coffres Individuels</h3>
                <p className="text-sm text-muted-foreground">Mon épargne</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6 py-3 border-t border-border/30">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-primary">{personalStats?.count || 0}</span>
                <span className="text-xs text-muted-foreground">actifs</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground">{formatAmount(personalStats?.total || 0)}</span>
                <span className="text-xs text-muted-foreground">FCFA</span>
              </div>
            </div>
            
            {/* CTA */}
            <div className="flex items-center justify-end text-sm text-primary mt-3 font-medium">
              <span>Voir mes coffres</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </motion.div>

          {/* Collective Vaults Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigate('/mobile-flow/collaborative-vaults')}
            className="bg-card rounded-2xl p-5 shadow-soft-md border border-border/50 cursor-pointer"
          >
            {/* Icon + Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground">Coffres Collectifs</h3>
                <p className="text-sm text-muted-foreground">Épargne partagée</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6 py-3 border-t border-border/30">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-amber-600">{collabStats?.count || 0}</span>
                <span className="text-xs text-muted-foreground">groupes</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground">{collabStats?.members || 0}</span>
                <span className="text-xs text-muted-foreground">membres</span>
              </div>
            </div>
            
            {/* CTA */}
            <div className="flex items-center justify-end text-sm text-amber-600 mt-3 font-medium">
              <span>Voir mes collectifs</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VaultsHubPage;
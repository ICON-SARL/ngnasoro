import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Users, ArrowRight, TrendingUp, Target, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/5 rounded-full blur-sm"
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => handleNavigate('/mobile-flow/dashboard')}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              Mes Coffres
            </h1>
            <p className="text-white/70 text-sm mt-1">
              Choisissez votre type d'épargne
            </p>
          </div>
        </motion.div>

        {/* Cards Container */}
        <div className="space-y-6 max-w-md mx-auto">
          {/* Personal Vaults Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigate('/mobile-flow/vaults')}
            className="relative group cursor-pointer"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-indigo-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Card */}
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              {/* Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-purple-500/20 rounded-full text-xs font-medium text-white border border-purple-400/30">
                Populaire
              </div>
              
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <Lock className="w-8 h-8 text-white" />
              </div>
              
              {/* Title and description */}
              <h3 className="text-2xl font-bold text-white mb-2">
                Coffres Personnels
              </h3>
              <p className="text-white/70 text-sm mb-4">
                Épargnez à votre rythme pour atteindre vos objectifs personnels
              </p>
              
              {/* Stats */}
              <div className="flex gap-4 mb-4 pb-4 border-b border-white/10">
                <div>
                  <p className="text-2xl font-bold text-white">{personalStats?.count || 0}</p>
                  <p className="text-xs text-white/60">Coffres actifs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{formatAmount(personalStats?.total || 0)}</p>
                  <p className="text-xs text-white/60">FCFA épargnés</p>
                </div>
              </div>
              
              {/* Features */}
              <div className="space-y-2 mb-5">
                {[
                  { icon: Shield, text: 'Épargne 100% privée' },
                  { icon: Target, text: 'Objectifs personnalisés' },
                  { icon: TrendingUp, text: 'Retraits flexibles' }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                    <div className="w-5 h-5 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-3 h-3 text-purple-400" />
                    </div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA Button */}
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl py-3 shadow-lg group-hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Accéder à mes coffres
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>

          {/* Collaborative Vaults Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigate('/mobile-flow/collaborative-vaults')}
            className="relative group cursor-pointer"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/30 to-pink-600/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Card */}
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              {/* Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-orange-500/20 rounded-full text-xs font-medium text-white border border-orange-400/30">
                Nouveau
              </div>
              
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                <Users className="w-8 h-8 text-white" />
              </div>
              
              {/* Title and description */}
              <h3 className="text-2xl font-bold text-white mb-2">
                Coffres Collaboratifs
              </h3>
              <p className="text-white/70 text-sm mb-4">
                Épargnez ensemble avec vos proches pour des projets communs
              </p>
              
              {/* Stats */}
              <div className="flex gap-4 mb-4 pb-4 border-b border-white/10">
                <div>
                  <p className="text-2xl font-bold text-white">{collabStats?.count || 0}</p>
                  <p className="text-xs text-white/60">Groupes actifs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{collabStats?.members || 0}</p>
                  <p className="text-xs text-white/60">Membres total</p>
                </div>
              </div>
              
              {/* Features */}
              <div className="space-y-2 mb-5">
                {[
                  { icon: Users, text: 'Épargne en groupe' },
                  { icon: Heart, text: 'Projets partagés' },
                  { icon: Shield, text: 'Votes démocratiques' }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                    <div className="w-5 h-5 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-3 h-3 text-orange-400" />
                    </div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA Button */}
              <Button 
                className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold rounded-xl py-3 shadow-lg group-hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Voir mes groupes
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Footer Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 max-w-md mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <p className="text-white/60 text-xs text-center">
              💡 <span className="font-medium text-white/80">Astuce :</span> Combinez les deux types de coffres pour diversifier votre épargne
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VaultsHubPage;

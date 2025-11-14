import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const TontineSection: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();

  const { data: tontines, isLoading } = useQuery({
    queryKey: ['user-tontines', user?.id, activeSfdId],
    queryFn: async () => {
      if (!user?.id || !activeSfdId) return [];
      
      const { data, error } = await supabase
        .from('tontine_members')
        .select(`
          *,
          tontines:tontine_id (
            id,
            name,
            contribution_amount,
            frequency,
            current_members,
            max_members,
            total_collected
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!activeSfdId
  });

  const totalContributed = tontines?.reduce((sum, t) => sum + (t.total_contributed || 0), 0) || 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
        <h2 className="text-lg font-semibold text-foreground">Mes Tontines</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/mobile-flow/tontine')}
          className="text-primary"
        >
          Voir tout
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {tontines && tontines.length > 0 ? (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90">Total épargné</p>
                <p className="text-2xl font-bold">{formatAmount(totalContributed)} FCFA</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>{tontines.length} tontine{tontines.length > 1 ? 's' : ''} active{tontines.length > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {tontines.slice(0, 2).map((membership: any) => (
              <motion.div
                key={membership.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/mobile-flow/tontine/${membership.tontine_id}`)}
                className="bg-card rounded-2xl p-4 border border-border shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h3 className="font-medium text-sm mb-1 line-clamp-1">{membership.tontines?.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {membership.tontines?.current_members}/{membership.tontines?.max_members} membres
                </p>
                <p className="text-sm font-semibold text-primary">
                  {formatAmount(membership.total_contributed)} FCFA
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 rounded-3xl p-6 text-center border border-sky-200/50 dark:border-sky-800/50">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Rejoignez une Tontine</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Épargnez ensemble et atteignez vos objectifs financiers
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => navigate('/mobile-flow/tontine')}
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-2xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Rejoindre
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TontineSection;

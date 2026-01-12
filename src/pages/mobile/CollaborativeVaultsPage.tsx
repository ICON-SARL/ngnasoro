import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, Plus, Crown, TrendingUp, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const CollaborativeVaultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'my_vaults' | 'invited' | 'public'>('my_vaults');

  const respondMutation = useMutation({
    mutationFn: async ({ invitation_id, action }: { invitation_id: string; action: 'accept' | 'reject' }) => {
      const { data, error } = await supabase.functions.invoke('respond-vault-invitation', {
        body: { invitation_id, action }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-vaults'] });
      if (variables.action === 'accept') {
        toast.success('Invitation acceptée avec succès');
        if (data?.vault_id) {
          navigate(`/mobile-flow/collaborative-vault/${data.vault_id}`);
        }
      } else {
        toast.success('Invitation refusée');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la réponse à l\'invitation');
    }
  });

  const { data: vaults, isLoading } = useQuery({
    queryKey: ['collaborative-vaults', user?.id, filter],
    queryFn: async () => {
      if (!user?.id) return [];
      
      if (filter === 'invited') {
        const { data: invitations, error: invError } = await supabase
          .from('collaborative_vault_invitations')
          .select(`
            *,
            collaborative_vaults(
              *,
              collaborative_vault_members(user_id, status, total_contributed, is_admin)
            )
          `)
          .eq('invited_user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        
        if (invError) throw invError;
        return invitations?.map(inv => ({
          ...inv.collaborative_vaults,
          invitation_id: inv.id,
          is_invitation: true
        })) || [];
      }

      let query = supabase
        .from('collaborative_vaults')
        .select(`
          *,
          collaborative_vault_members(user_id, status, total_contributed, is_admin)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'my_vaults') {
        query = query.eq('creator_id', user.id);
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
      <div className="bg-gradient-to-b from-primary via-primary/90 to-background">
        <div className="px-4 py-6 pb-10">
          <button onClick={() => navigate(-1)} className="mb-4 p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white mb-2">Coffres Collectifs</h1>
          <p className="text-sm text-white/80">Atteignez vos objectifs ensemble</p>
        </div>
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
                  ? 'bg-primary text-primary-foreground'
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
              <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : vaults && vaults.length > 0 ? (
          <div className="space-y-3">
            {vaults.map((vault: any) => {
              const progress = (vault.current_amount / vault.target_amount) * 100;
              const isCreator = vault.creator_id === user?.id;
              const memberCount = vault.member_count || 0;
              const isInvitation = vault.is_invitation;
              
              return (
                <motion.div
                  key={vault.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => !isInvitation && navigate(`/mobile-flow/collaborative-vault/${vault.id}`)}
                  className="bg-card rounded-2xl p-5 border border-border/50 shadow-soft-sm cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
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
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Admin
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
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex justify-between items-end mb-3">
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

                  {/* Invitation Actions */}
                  {isInvitation && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          respondMutation.mutate({ invitation_id: vault.invitation_id, action: 'accept' });
                        }}
                        disabled={respondMutation.isPending}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accepter
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          respondMutation.mutate({ invitation_id: vault.invitation_id, action: 'reject' });
                        }}
                        disabled={respondMutation.isPending}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Refuser
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              {filter === 'my_vaults' ? 'Aucun coffre créé' : 
               filter === 'invited' ? 'Aucune invitation' : 
               'Aucun coffre public'}
            </p>
            <Button 
              onClick={() => navigate('/mobile-flow/create-collaborative-vault')}
              className="bg-primary hover:bg-primary/90 rounded-2xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau coffre collectif
            </Button>
          </div>
        )}
      </div>

      {/* FAB */}
      <Button
        onClick={() => navigate('/mobile-flow/create-collaborative-vault')}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-soft-lg"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default CollaborativeVaultsPage;
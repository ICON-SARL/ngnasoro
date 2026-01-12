import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Vault, TrendingUp, TrendingDown, Calendar, Lock, Target, Loader2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const VaultDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { vaultId } = useParams();
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const { data: vault, isLoading } = useQuery({
    queryKey: ['vault', vaultId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vaults' as any)
        .select('*')
        .eq('id', vaultId!)
        .eq('user_id', user!.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!vaultId && !!user
  });

  const { data: contributions } = useQuery({
    queryKey: ['vault-contributions', vaultId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vault_contributions' as any)
        .select('*')
        .eq('vault_id', vaultId!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!vaultId
  });

  const { data: withdrawals } = useQuery({
    queryKey: ['vault-withdrawals', vaultId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vault_withdrawals' as any)
        .select('*')
        .eq('vault_id', vaultId!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!vaultId
  });

  const { data: accounts } = useQuery({
    queryKey: ['user-accounts', user?.id, activeSfdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user!.id)
        .eq('sfd_id', activeSfdId!)
        .eq('status', 'active');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!activeSfdId
  });

  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      const sourceAccount = accounts?.[0];
      if (!sourceAccount) throw new Error('Aucun compte source disponible');

      const { data, error } = await supabase.functions.invoke('deposit-vault', {
        body: {
          vault_id: vaultId,
          amount,
          source_account_id: sourceAccount.id
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Erreur lors du dépôt');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault', vaultId] });
      queryClient.invalidateQueries({ queryKey: ['vault-contributions', vaultId] });
      queryClient.invalidateQueries({ queryKey: ['user-accounts'] });
      
      toast({
        title: 'Dépôt effectué !',
        description: 'Votre coffre a été alimenté avec succès',
      });
      
      setDepositAmount('');
      setIsDepositOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const destAccount = accounts?.[0];
      if (!destAccount) throw new Error('Aucun compte destination disponible');

      const { data, error } = await supabase.functions.invoke('withdraw-vault', {
        body: {
          vault_id: vaultId,
          amount,
          destination_account_id: destAccount.id
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Erreur lors du retrait');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault', vaultId] });
      queryClient.invalidateQueries({ queryKey: ['vault-withdrawals', vaultId] });
      queryClient.invalidateQueries({ queryKey: ['user-accounts'] });
      
      toast({
        title: 'Retrait effectué !',
        description: 'Les fonds ont été transférés vers votre compte',
      });
      
      setWithdrawAmount('');
      setIsWithdrawOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Erreur',
        description: 'Montant invalide',
        variant: 'destructive'
      });
      return;
    }
    depositMutation.mutate(amount);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Erreur',
        description: 'Montant invalide',
        variant: 'destructive'
      });
      return;
    }
    withdrawMutation.mutate(amount);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const vaultData = vault as any;

  if (isLoading || !vault) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = vaultData.target_amount > 0 
    ? (Number(vaultData.current_amount) / Number(vaultData.target_amount)) * 100 
    : 0;

  const canWithdraw = vaultData.status !== 'closed' && 
    (vaultData.type !== 'locked' || !vaultData.deadline || new Date() >= new Date(vaultData.deadline));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-b from-primary via-primary/90 to-background">
        <div className="px-4 py-6 pb-12 text-white">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Vault className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{vaultData.name}</h1>
              {vaultData.description && (
                <p className="text-sm opacity-90 mt-1">{vaultData.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm mb-4">
            {vaultData.type === 'locked' && (
              <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Verrouillé
              </span>
            )}
            {vaultData.deadline && (
              <span className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(vaultData.deadline).toLocaleDateString('fr-FR')}
              </span>
            )}
            {vaultData.status === 'goal_reached' && (
              <span className="bg-green-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                <Target className="w-3 h-3" />
                Objectif atteint
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        <div className="bg-card rounded-3xl p-6 border border-border shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Progression</span>
            <span className="text-2xl font-bold text-primary">{progress.toFixed(1)}%</span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden mb-4">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Montant actuel</p>
                <p className="text-3xl font-bold text-foreground">
                {formatAmount(Number(vaultData.current_amount))} <span className="text-lg">FCFA</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Objectif</p>
              <p className="text-xl font-semibold text-muted-foreground">
                {formatAmount(Number(vaultData.target_amount))} FCFA
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
            <DialogTrigger asChild>
              <Button 
                className="h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white"
                disabled={vaultData.status === 'closed'}
              >
                <Plus className="w-5 h-5 mr-2" />
                Déposer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Alimenter le coffre</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Montant (FCFA)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    placeholder="0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="rounded-2xl"
                  />
                </div>
                <Button
                  onClick={handleDeposit}
                  disabled={depositMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl"
                >
                  {depositMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    'Confirmer le dépôt'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="h-14 rounded-2xl"
                disabled={!canWithdraw}
              >
                <Minus className="w-5 h-5 mr-2" />
                Retirer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Retirer du coffre</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Montant (FCFA)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    placeholder="0"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="rounded-2xl"
                    max={Number(vaultData.current_amount)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Disponible: {formatAmount(Number(vaultData.current_amount))} FCFA
                  </p>
                </div>
                <Button
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending}
                  className="w-full rounded-2xl"
                  variant="outline"
                >
                  {withdrawMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    'Confirmer le retrait'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground px-2">Historique</h2>
          
          {contributions && contributions.length > 0 && contributions.map((contrib: any) => (
            <motion.div
              key={contrib.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Dépôt</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(contrib.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-green-600 dark:text-green-400">
                +{formatAmount(Number(contrib.amount))} FCFA
              </span>
            </motion.div>
          ))}

          {withdrawals && withdrawals.length > 0 && withdrawals.map((withdrawal: any) => (
            <motion.div
              key={withdrawal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Retrait</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(withdrawal.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-red-600 dark:text-red-400">
                -{formatAmount(Number(withdrawal.amount))} FCFA
              </span>
            </motion.div>
          ))}

          {(!contributions || contributions.length === 0) && (!withdrawals || withdrawals.length === 0) && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Aucune transaction pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaultDetailsPage;
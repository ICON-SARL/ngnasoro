import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, Users, TrendingUp, Calendar, Crown, UserPlus, 
  ArrowDownCircle, ArrowUpCircle, AlertCircle, ThumbsUp, ThumbsDown,
  Lock, Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { UltraInput } from '@/components/ui/ultra-modern/UltraInput';
import { UltraButton } from '@/components/ui/ultra-modern/UltraButton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CollaborativeVaultDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { vaultId } = useParams<{ vaultId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [inviteContact, setInviteContact] = useState('');

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
            interest_earned,
            is_admin,
            joined_at,
            profiles:user_id(full_name, avatar_url, phone)
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

  // Fetch pending withdrawal requests
  const { data: withdrawalRequests } = useQuery({
    queryKey: ['vault-withdrawal-requests', vaultId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborative_vault_withdrawal_requests')
        .select(`
          *,
          profiles:requested_by(full_name)
        `)
        .eq('vault_id', vaultId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!vaultId
  });

  // Fetch user's votes on requests
  const { data: userVotes } = useQuery({
    queryKey: ['user-votes', vaultId, user?.id],
    queryFn: async () => {
      const { data: member } = await supabase
        .from('collaborative_vault_members')
        .select('id')
        .eq('vault_id', vaultId)
        .eq('user_id', user?.id)
        .single();

      if (!member) return [];

      const { data, error } = await supabase
        .from('collaborative_vault_withdrawal_votes')
        .select('withdrawal_request_id, vote')
        .eq('member_id', member.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!vaultId && !!user?.id
  });

  const { data: userAccount } = useQuery({
    queryKey: ['user-account', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const depositMutation = useMutation({
    mutationFn: async (depositAmount: number) => {
      if (!userAccount?.id) throw new Error('Compte introuvable');
      
      const { data, error } = await supabase.functions.invoke('deposit-collaborative-vault', {
        body: { 
          vault_id: vaultId, 
          amount: depositAmount,
          source_account_id: userAccount.id,
          description: 'Dépôt dans le coffre collaboratif'
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-vault', vaultId] });
      queryClient.invalidateQueries({ queryKey: ['user-account', user?.id] });
      toast.success('Dépôt effectué avec succès');
      setShowDepositModal(false);
      setAmount('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du dépôt');
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: async ({ withdrawAmount, withdrawReason }: { withdrawAmount: number; withdrawReason: string }) => {
      const { data, error } = await supabase.functions.invoke('request-vault-withdrawal', {
        body: { 
          vault_id: vaultId, 
          amount: withdrawAmount,
          reason: withdrawReason,
          destination_account_id: userAccount?.id
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-vault', vaultId] });
      queryClient.invalidateQueries({ queryKey: ['vault-withdrawal-requests', vaultId] });
      toast.success('Demande de retrait créée avec succès');
      setShowWithdrawModal(false);
      setAmount('');
      setReason('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la demande de retrait');
    }
  });

  const voteMutation = useMutation({
    mutationFn: async ({ requestId, vote }: { requestId: string; vote: boolean }) => {
      const { data, error } = await supabase.functions.invoke('vote-withdrawal', {
        body: { 
          withdrawal_request_id: requestId, 
          vote
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-vault', vaultId] });
      queryClient.invalidateQueries({ queryKey: ['vault-withdrawal-requests', vaultId] });
      queryClient.invalidateQueries({ queryKey: ['user-votes', vaultId, user?.id] });
      
      if (data.status === 'approved') {
        toast.success('Retrait approuvé et exécuté');
      } else if (data.status === 'rejected') {
        toast.info('Retrait rejeté');
      } else {
        toast.success('Vote enregistré');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors du vote');
    }
  });

  const inviteMutation = useMutation({
    mutationFn: async (contact: string) => {
      const isEmail = contact.includes('@');
      
      const { data, error } = await supabase.functions.invoke('invite-to-vault', {
        body: { 
          vault_id: vaultId, 
          [isEmail ? 'email' : 'phone']: contact
        }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-vault', vaultId] });
      toast.success('Invitation envoyée avec succès');
      setShowInviteModal(false);
      setInviteContact('');
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Erreur lors de l\'envoi de l\'invitation';
      toast.error(errorMessage, {
        duration: 5000
      });
    }
  });

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error('Montant invalide');
      return;
    }
    if (!userAccount || userAccount.balance < depositAmount) {
      toast.error('Solde insuffisant');
      return;
    }
    depositMutation.mutate(depositAmount);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Montant invalide');
      return;
    }
    if (!reason.trim()) {
      toast.error('Veuillez indiquer une raison');
      return;
    }
    withdrawMutation.mutate({ withdrawAmount, withdrawReason: reason });
  };

  const hasVoted = (requestId: string) => {
    return userVotes?.some(v => v.withdrawal_request_id === requestId);
  };

  const pendingRequests = withdrawalRequests?.filter(r => r.status === 'pending') || [];
  const isVaultClosed = vault?.status === 'closed';
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
  const userMembership = members.find(m => m.user_id === user?.id);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary via-primary/90 to-background">
        <div className="px-4 py-6 pb-8 text-white">
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
            <div className="flex gap-2">
              {isCreator && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Admin
                </span>
              )}
              {(isCreator || members.find(m => m.user_id === user?.id && m.is_admin)) && (
                <Button 
                  onClick={() => setShowInviteModal(true)} 
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Closed Vault Banner */}
        {isVaultClosed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">Ce coffre est fermé</p>
                <p className="text-sm text-red-600 dark:text-red-500">
                  {vault.close_reason || 'Retrait total effectué'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pending Withdrawal Requests */}
        {pendingRequests.length > 0 && !isVaultClosed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4"
          >
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5" />
              Demandes de retrait ({pendingRequests.length})
            </h3>
            <div className="space-y-3">
              {pendingRequests.map((request: any) => (
                <div key={request.id} className="bg-white dark:bg-background rounded-xl p-3 border border-amber-200 dark:border-amber-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{formatAmount(request.amount)} FCFA</p>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Par: {request.profiles?.full_name || 'Membre'} • {formatDate(request.created_at)}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full text-xs">
                      {request.votes_yes}/{request.total_votes_required} votes
                    </span>
                  </div>
                  
                  {!hasVoted(request.id) && request.requested_by !== user?.id && (
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm"
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={() => voteMutation.mutate({ requestId: request.id, vote: true })}
                        disabled={voteMutation.isPending}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                      <Button 
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => voteMutation.mutate({ requestId: request.id, vote: false })}
                        disabled={voteMutation.isPending}
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        Refuser
                      </Button>
                    </div>
                  )}
                  {hasVoted(request.id) && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">✓ Vous avez déjà voté</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
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
                className="h-full bg-primary transition-all"
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
              Membres ({members.filter(m => m.status === 'active').length})
            </h2>
          </div>

          <div className="space-y-3">
            {members
              .filter(m => m.status === 'active')
              .map((member: any) => {
                const memberProfile = member.profiles;
                const initials = memberProfile?.full_name 
                  ? memberProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                  : '?';
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-foreground flex items-center gap-1">
                          {memberProfile?.full_name || 'Membre'}
                          {member.user_id === vault.creator_id && (
                            <Crown className="w-3 h-3 text-yellow-500" />
                          )}
                          {member.user_id === user?.id && (
                            <span className="text-xs text-muted-foreground ml-1">(Vous)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Contribué: {formatAmount(member.total_contributed || 0)} FCFA
                        </p>
                        {(member.interest_earned || 0) > 0 && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            Intérêts: +{formatAmount(member.interest_earned)} FCFA
                          </p>
                        )}
                      </div>
                    </div>
                    {member.is_admin && member.user_id !== vault.creator_id && (
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                );
              })
            }
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
          <Button 
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-12"
            onClick={() => setShowDepositModal(true)}
            disabled={depositMutation.isPending}
          >
            {depositMutation.isPending ? 'Traitement...' : 'Déposer'}
          </Button>
          <Button 
            variant="outline" 
            className="h-12"
            onClick={() => setShowWithdrawModal(true)}
            disabled={withdrawMutation.isPending}
          >
            {withdrawMutation.isPending ? 'Traitement...' : 'Retirer'}
          </Button>
        </div>
      </div>

      {/* Deposit Bottom Sheet */}
      <Sheet open={showDepositModal} onOpenChange={setShowDepositModal}>
        <SheetContent side="bottom" className="rounded-t-3xl border-t border-border pb-8">
          <SheetHeader className="pb-2">
            <div className="flex items-center gap-4 pt-4">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <ArrowDownCircle className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <SheetTitle className="text-xl font-bold text-foreground">
                  Déposer dans le coffre
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  Solde disponible : {userAccount ? formatAmount(userAccount.balance) : '0'} FCFA
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="space-y-5 pt-6">
            {/* Quick amount buttons */}
            <div className="flex gap-2 flex-wrap">
              {[1000, 5000, 10000, 25000].map((quickAmount) => (
                <motion.button
                  key={quickAmount}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAmount(quickAmount.toString())}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                    amount === quickAmount.toString()
                      ? "bg-primary text-primary-foreground shadow-soft-md"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  {formatAmount(quickAmount)}
                </motion.button>
              ))}
            </div>
            
            {/* Input with FCFA indicator */}
            <div className="relative">
              <UltraInput
                type="number"
                label="Montant"
                placeholder="Entrez le montant"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 translate-y-1 text-sm font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                FCFA
              </span>
            </div>
            
            {/* Action button */}
            <UltraButton
              variant="success"
              size="lg"
              fullWidth
              loading={depositMutation.isPending}
              disabled={!amount || parseFloat(amount) <= 0}
              onClick={handleDeposit}
              icon={<ArrowDownCircle className="w-5 h-5" />}
            >
              Confirmer le dépôt
            </UltraButton>
          </div>
        </SheetContent>
      </Sheet>

      {/* Withdraw Bottom Sheet */}
      <Sheet open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <SheetContent side="bottom" className="rounded-t-3xl border-t border-border pb-8">
          <SheetHeader className="pb-2">
            <div className="flex items-center gap-4 pt-4">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <ArrowUpCircle className="w-7 h-7 text-amber-600" />
              </div>
              <div className="flex-1 text-left">
                <SheetTitle className="text-xl font-bold text-foreground">
                  Demander un retrait
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  Solde du coffre : {formatAmount(vault.current_amount)} FCFA
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="space-y-5 pt-6">
            <UltraInput
              type="number"
              label="Montant (FCFA)"
              placeholder="Entrez le montant"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            
            <UltraInput
              type="text"
              label="Raison du retrait"
              placeholder="Expliquez la raison de votre demande"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            
            <UltraButton
              variant="primary"
              size="lg"
              fullWidth
              loading={withdrawMutation.isPending}
              disabled={!amount || !reason.trim()}
              onClick={handleWithdraw}
              icon={<ArrowUpCircle className="w-5 h-5" />}
            >
              Créer la demande
            </UltraButton>
          </div>
        </SheetContent>
      </Sheet>

      {/* Invite Bottom Sheet */}
      <Sheet open={showInviteModal} onOpenChange={setShowInviteModal}>
        <SheetContent side="bottom" className="rounded-t-3xl border-t border-border pb-8">
          <SheetHeader className="pb-2">
            <div className="flex items-center gap-4 pt-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <SheetTitle className="text-xl font-bold text-foreground">
                  Inviter un membre
                </SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  L'invitation sera envoyée par email ou SMS
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="space-y-5 pt-6">
            <UltraInput
              type="text"
              label="Email ou Téléphone"
              placeholder="exemple@email.com ou 0612345678"
              value={inviteContact}
              onChange={(e) => setInviteContact(e.target.value)}
              helperText="Le membre recevra une invitation à accepter"
            />
            
            <UltraButton
              variant="gradient"
              size="lg"
              fullWidth
              loading={inviteMutation.isPending}
              disabled={!inviteContact.trim()}
              onClick={() => inviteMutation.mutate(inviteContact)}
              icon={<UserPlus className="w-5 h-5" />}
            >
              Envoyer l'invitation
            </UltraButton>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CollaborativeVaultDetailsPage;

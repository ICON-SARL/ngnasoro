import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, TrendingUp, Calendar, Crown, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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
          reason: withdrawReason
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-vault', vaultId] });
      toast.success('Demande de retrait créée avec succès');
      setShowWithdrawModal(false);
      setAmount('');
      setReason('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la demande de retrait');
    }
  });

  const inviteMutation = useMutation({
    mutationFn: async (contact: string) => {
      const isEmail = contact.includes('@');
      
      // Vérification côté client : ne pas s'inviter soi-même
      if (isEmail && user?.email && contact.toLowerCase() === user.email.toLowerCase()) {
        throw new Error('Vous ne pouvez pas vous inviter vous-même');
      }
      
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
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'invitation');
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

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
      <div className="bg-gradient-to-br from-orange-500 to-pink-600 text-white p-6 pb-8">
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
                Créateur
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

      <div className="px-4 -mt-4 space-y-4">
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
                className="h-full bg-gradient-to-r from-orange-500 to-pink-600 transition-all"
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

      {/* Deposit Modal */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Déposer dans le coffre</DialogTitle>
            <DialogDescription>
              Montant disponible : {userAccount ? formatAmount(userAccount.balance) : '0'} FCFA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount">Montant (FCFA)</Label>
              <Input
                id="deposit-amount"
                type="number"
                placeholder="Entrez le montant"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
              />
            </div>
            <Button 
              onClick={handleDeposit} 
              className="w-full"
              disabled={depositMutation.isPending || !amount}
            >
              {depositMutation.isPending ? 'Traitement...' : 'Confirmer le dépôt'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Demander un retrait</DialogTitle>
            <DialogDescription>
              Solde du coffre : {formatAmount(vault.current_amount)} FCFA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Montant (FCFA)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="Entrez le montant"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                max={vault.current_amount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdraw-reason">Raison du retrait</Label>
              <Input
                id="withdraw-reason"
                type="text"
                placeholder="Expliquez la raison du retrait"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleWithdraw} 
              className="w-full"
              disabled={withdrawMutation.isPending || !amount || !reason}
            >
              {withdrawMutation.isPending ? 'Traitement...' : 'Créer la demande'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inviter un membre</DialogTitle>
            <DialogDescription>
              Invitez quelqu'un à rejoindre ce coffre collaboratif
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-contact">Email ou Téléphone</Label>
              <Input
                id="invite-contact"
                type="text"
                placeholder="exemple@email.com ou 0612345678"
                value={inviteContact}
                onChange={(e) => setInviteContact(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Le membre recevra une invitation qu'il pourra accepter ou refuser
              </p>
            </div>
            <Button 
              onClick={() => inviteMutation.mutate(inviteContact)} 
              className="w-full"
              disabled={inviteMutation.isPending || !inviteContact.trim()}
            >
              {inviteMutation.isPending ? 'Envoi...' : 'Envoyer l\'invitation'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollaborativeVaultDetailsPage;

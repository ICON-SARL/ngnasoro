import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, Lock, Globe, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CreateCollaborativeVaultPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    visibility: 'private',
    withdrawal_rule: 'creator_only',
    allow_withdrawal_before_goal: false,
    deadline: ''
  });

  const createVaultMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase.functions.invoke('create-collaborative-vault', {
        body: {
          ...data,
          target_amount: parseFloat(data.target_amount),
          sfd_id: activeSfdId,
          deadline: data.deadline || null
        }
      });

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Coffre créé !',
        description: 'Votre coffre collaboratif a été créé avec succès',
      });
      navigate('/mobile-flow/collaborative-vaults');
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la création du coffre',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.target_amount) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    if (parseFloat(formData.target_amount) <= 0) {
      toast({
        title: 'Montant invalide',
        description: 'Le montant doit être supérieur à 0',
        variant: 'destructive'
      });
      return;
    }

    createVaultMutation.mutate(formData);
  };

  const visibilityOptions = [
    { value: 'private', label: 'Privé', icon: Lock, description: 'Visible uniquement par vous' },
    { value: 'invite_only', label: 'Sur invitation', icon: UserCheck, description: 'Rejoindre sur invitation uniquement' },
    { value: 'public', label: 'Public', icon: Globe, description: 'Visible par tout le monde' }
  ];

  const withdrawalRules = [
    { value: 'creator_only', label: 'Créateur uniquement', description: 'Seul le créateur peut retirer' },
    { value: 'majority_vote', label: 'Vote majoritaire', description: 'Majorité des membres doit approuver' },
    { value: 'unanimous', label: 'Unanimité', description: 'Tous les membres doivent approuver' }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-pink-600 text-white p-6 pb-8">
        <button onClick={() => navigate(-1)} className="mb-4 p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Créer un Coffre Collaboratif</h1>
        <p className="text-sm opacity-90">Définissez votre objectif d'épargne commun</p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 -mt-4 space-y-6">
        {/* Basic Info Card */}
        <div className="bg-card rounded-3xl p-6 border border-border">
          <h2 className="font-semibold mb-4 text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Informations de base
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du coffre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Vacances 2025"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez l'objectif de ce coffre..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="target_amount">Montant objectif (FCFA) *</Label>
              <Input
                id="target_amount"
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                placeholder="500000"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="deadline">Date limite (optionnel)</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Visibility Card */}
        <div className="bg-card rounded-3xl p-6 border border-border">
          <h2 className="font-semibold mb-4 text-foreground">Visibilité</h2>
          <div className="space-y-2">
            {visibilityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  onClick={() => setFormData({ ...formData, visibility: option.value })}
                  className={`p-4 rounded-2xl cursor-pointer transition-all ${
                    formData.visibility === option.value
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-muted border-2 border-transparent hover:bg-accent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${formData.visibility === option.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Withdrawal Rules Card */}
        <div className="bg-card rounded-3xl p-6 border border-border">
          <h2 className="font-semibold mb-4 text-foreground">Règles de retrait</h2>
          <div className="space-y-2">
            {withdrawalRules.map((rule) => (
              <div
                key={rule.value}
                onClick={() => setFormData({ ...formData, withdrawal_rule: rule.value })}
                className={`p-4 rounded-2xl cursor-pointer transition-all ${
                  formData.withdrawal_rule === rule.value
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-muted border-2 border-transparent hover:bg-accent'
                }`}
              >
                <p className="font-medium text-foreground">{rule.label}</p>
                <p className="text-xs text-muted-foreground">{rule.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between p-4 bg-muted rounded-2xl">
            <div>
              <Label htmlFor="allow_withdrawal">Autoriser les retraits avant l'objectif</Label>
              <p className="text-xs text-muted-foreground mt-1">Les membres peuvent retirer même si l'objectif n'est pas atteint</p>
            </div>
            <Switch
              id="allow_withdrawal"
              checked={formData.allow_withdrawal_before_goal}
              onCheckedChange={(checked) => setFormData({ ...formData, allow_withdrawal_before_goal: checked })}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={createVaultMutation.isPending}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-600 h-12 text-base font-semibold"
        >
          {createVaultMutation.isPending ? 'Création...' : 'Créer le coffre'}
        </Button>
      </form>
    </div>
  );
};

export default CreateCollaborativeVaultPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Vault, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CreateVaultPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    type: 'simple' as 'simple' | 'locked' | 'project',
    deadline: ''
  });

  const createVaultMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase.functions.invoke('create-vault', {
        body: {
          ...data,
          target_amount: parseFloat(data.target_amount),
          sfd_id: activeSfdId,
          deadline: data.type === 'locked' && data.deadline ? data.deadline : null
        }
      });

      if (error) throw error;
      if (!result.success) throw new Error(result.error || 'Erreur lors de la création');
      
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: 'Coffre créé !',
        description: 'Votre coffre d\'épargne a été créé avec succès',
      });
      navigate(`/mobile-flow/vault/${data.vault.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.target_amount) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    if (parseFloat(formData.target_amount) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Le montant objectif doit être supérieur à 0',
        variant: 'destructive'
      });
      return;
    }

    if (formData.type === 'locked' && !formData.deadline) {
      toast({
        title: 'Erreur',
        description: 'Une date limite est requise pour un coffre verrouillé',
        variant: 'destructive'
      });
      return;
    }

    createVaultMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary via-primary/90 to-background">
        <div className="px-4 py-6 pb-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white mb-2">Nouveau Coffre Individuel</h1>
          <p className="text-sm text-white/80">Définissez votre objectif d'épargne</p>
        </div>
      </div>

      <div className="px-4 -mt-4">
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft-sm space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du coffre *</Label>
            <Input
              id="name"
              placeholder="Ex: Vacances, Voiture, Mariage..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre objectif..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="rounded-xl min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_amount">Montant objectif (FCFA) *</Label>
            <Input
              id="target_amount"
              type="number"
              placeholder="0"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Type de coffre</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'simple', label: 'Simple', desc: 'Retrait libre' },
                { value: 'locked', label: 'Verrouillé', desc: 'Jusqu\'à une date' },
                { value: 'project', label: 'Projet', desc: 'Garantie prêt' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value as any })}
                  className={`p-3 rounded-xl border-2 transition-colors ${
                    formData.type === type.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="text-sm font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {formData.type === 'locked' && (
            <div className="space-y-2">
              <Label htmlFor="deadline">Date limite de verrouillage *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="rounded-xl"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Le retrait sera impossible avant cette date
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={createVaultMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12"
          >
            {createVaultMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Vault className="w-4 h-4 mr-2" />
                Créer le coffre
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateVaultPage;
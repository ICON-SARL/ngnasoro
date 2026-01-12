import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Vault, Sparkles, Lock, Target, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UltraInput } from '@/components/ui/ultra-modern/UltraInput';
import { UltraButton } from '@/components/ui/ultra-modern/UltraButton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const vaultTypes = [
  { value: 'simple' as const, label: 'Simple', desc: 'Retrait libre', icon: Sparkles },
  { value: 'locked' as const, label: 'Verrouillé', desc: "Jusqu'à une date", icon: Lock },
  { value: 'project' as const, label: 'Projet', desc: 'Garantie prêt', icon: Target }
];

const CreateVaultPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeSfdId } = useAuth();
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
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <div className="bg-gradient-to-b from-primary via-primary/90 to-background">
        <div className="px-4 py-6 pb-14">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="mb-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center"
            >
              <Vault className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-white">Nouveau Coffre</h1>
              <p className="text-sm text-white/70 mt-0.5">Définissez votre objectif d'épargne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="px-4 -mt-6 pb-8">
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 border border-border/30 shadow-soft-lg space-y-6"
        >
          {/* Vault Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <UltraInput
              label="Nom du coffre"
              placeholder="Ex: Vacances, Voiture, Mariage..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              icon={<Sparkles className="w-5 h-5" />}
            />
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <textarea
                placeholder="Décrivez votre objectif..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-4 rounded-2xl border border-border/60 bg-white focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15 min-h-[100px] text-base font-medium transition-all duration-300 resize-none"
              />
              <span className="absolute -top-2.5 left-3 px-2 text-xs font-medium text-muted-foreground bg-white">
                Description (optionnel)
              </span>
            </div>
          </motion.div>

          {/* Target Amount */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <UltraInput
              type="number"
              label="Montant objectif"
              placeholder="100 000"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              icon={<Target className="w-5 h-5" />}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl">
              FCFA
            </span>
          </motion.div>

          {/* Vault Type Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <span className="text-sm font-semibold text-foreground">Type de coffre</span>
            <div className="grid grid-cols-3 gap-3">
              {vaultTypes.map((type) => (
                <motion.button
                  key={type.value}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                    formData.type === type.value
                      ? 'border-primary bg-primary/5 shadow-soft-md'
                      : 'border-border/50 bg-white hover:border-primary/30 hover:bg-primary/[0.02]'
                  )}
                >
                  {/* Checkmark indicator */}
                  <AnimatePresence>
                    {formData.type === type.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-xs">✓</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center transition-colors",
                    formData.type === type.value ? 'bg-primary/15' : 'bg-muted'
                  )}>
                    <type.icon className={cn(
                      "w-5 h-5 transition-colors",
                      formData.type === type.value ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  
                  <div className="text-sm font-semibold text-foreground">{type.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{type.desc}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Deadline for locked vaults */}
          <AnimatePresence>
            {formData.type === 'locked' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <UltraInput
                  type="date"
                  label="Date limite de verrouillage"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  icon={<Calendar className="w-5 h-5" />}
                  helperText="Le retrait sera impossible avant cette date"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-2"
          >
            <UltraButton
              type="submit"
              variant="gradient"
              size="lg"
              fullWidth
              loading={createVaultMutation.isPending}
              icon={<Vault className="w-5 h-5" />}
            >
              {createVaultMutation.isPending ? 'Création en cours...' : 'Créer mon coffre'}
            </UltraButton>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateVaultPage;

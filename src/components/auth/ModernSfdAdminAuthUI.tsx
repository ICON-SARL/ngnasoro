import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UltraInput } from '@/components/ui/ultra-modern/UltraInput';
import { UltraButton } from '@/components/ui/ultra-modern/UltraButton';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { SuccessConfetti } from '@/components/ui/SuccessConfetti';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const ModernSfdAdminAuthUI: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trigger } = useHapticFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    trigger('medium');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
      if (error) throw error;
      trigger('success');
      setShowConfetti(true);
      toast({ title: 'Connexion réussie', description: 'Bienvenue SFD' });
      setTimeout(() => navigate('/sfd/dashboard'), 1500);
    } catch (error: any) {
      trigger('error');
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatePresence>{showConfetti && <SuccessConfetti onComplete={() => setShowConfetti(false)} />}</AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 space-y-6 border border-primary/30">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <AnimatedLogo size={120} withGlow withPulse />
                <motion.div className="absolute -bottom-2 -right-2" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-full"><Building2 className="w-5 h-5 text-white" /></div>
                </motion.div>
              </div>
            </div>
            <p className="text-primary text-lg font-semibold">Administration SFD</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <UltraInput type="email" label="Email SFD" icon={<Mail className="w-5 h-5" />} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <UltraInput type="password" label="Mot de passe" icon={<Lock className="w-5 h-5" />} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            <UltraButton type="submit" loading={loading} fullWidth variant="gradient" size="lg">Accéder</UltraButton>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernSfdAdminAuthUI;

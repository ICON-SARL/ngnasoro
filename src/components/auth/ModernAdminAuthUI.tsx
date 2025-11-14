import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UltraInput } from '@/components/ui/ultra-modern/UltraInput';
import { UltraButton } from '@/components/ui/ultra-modern/UltraButton';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { SuccessConfetti } from '@/components/ui/SuccessConfetti';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const ModernAdminAuthUI: React.FC = () => {
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
      toast({ title: 'Accès autorisé', description: 'Bienvenue MEREF' });
      setTimeout(() => navigate('/super-admin-dashboard'), 2000);
    } catch (error: any) {
      trigger('error');
      toast({ title: 'Accès refusé', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground particleCount={30} color="251, 191, 36" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-amber-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <AnimatePresence>{showConfetti && <SuccessConfetti onComplete={() => setShowConfetti(false)} />}</AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 space-y-6 border border-amber-500/20">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="relative">
                <AnimatedLogo size={120} withGlow withPulse />
                <motion.div className="absolute -top-2 -right-2" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-2 rounded-full shadow-lg"><Shield className="w-5 h-5 text-white" /></div>
                </motion.div>
              </div>
            </div>
            <p className="text-amber-400 text-lg font-semibold">Administration MEREF</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <UltraInput type="email" label="Email administrateur" icon={<Mail className="w-5 h-5" />} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <UltraInput type="password" label="Mot de passe" icon={<Lock className="w-5 h-5" />} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            <UltraButton type="submit" loading={loading} fullWidth variant="gradient" size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-600">Accéder</UltraButton>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernAdminAuthUI;

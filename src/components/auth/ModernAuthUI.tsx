import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UltraInput } from '@/components/ui/ultra-modern/UltraInput';
import { UltraButton } from '@/components/ui/ultra-modern/UltraButton';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { SuccessConfetti } from '@/components/ui/SuccessConfetti';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

const ModernAuthUI: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trigger } = useHapticFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    trigger('medium');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        trigger('success');
        setShowConfetti(true);
        toast({ title: 'Connexion réussie', description: 'Vous allez être redirigé...' });
        
        // Récupérer le rôle de l'utilisateur pour redirection intelligente
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();
        
        const role = roleData?.role || 'user';
        
        // Redirection selon le rôle
        setTimeout(() => {
          if (role === 'admin') {
            navigate('/super-admin-dashboard');
          } else if (role === 'sfd_admin') {
            navigate('/agency-dashboard');
          } else if (role === 'client') {
            navigate('/mobile-flow/dashboard');
          } else {
            // Rôle 'user' - doit adhérer à une SFD
            navigate('/pending-approval');
          }
        }, 1500);
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { 
            data: { full_name: formData.fullName },
            emailRedirectTo: `${window.location.origin}/pending-approval`
          },
        });
        if (error) throw error;
        trigger('success');
        toast({ 
          title: 'Inscription réussie', 
          description: 'Vérifiez votre email pour confirmer votre compte.' 
        });
      }
    } catch (error: any) {
      trigger('error');
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      <ParticleBackground particleCount={25} />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
      </div>
      <AnimatePresence>{showConfetti && <SuccessConfetti onComplete={() => setShowConfetti(false)} />}</AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 space-y-6 border border-border/50 shadow-2xl">
          <div className="text-center space-y-3">
            <div className="flex justify-center"><AnimatedLogo size={120} withGlow withPulse /></div>
            <p className="text-muted-foreground text-lg">{isLogin ? 'Accédez à votre espace personnel' : 'Créez votre compte'}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <UltraInput type="text" label="Nom complet" icon={<User className="w-5 h-5" />} value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                </motion.div>
              )}
            </AnimatePresence>
            <UltraInput type="email" label="Adresse email" icon={<Mail className="w-5 h-5" />} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <UltraInput type="password" label="Mot de passe" icon={<Lock className="w-5 h-5" />} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            <UltraButton type="submit" loading={loading} fullWidth variant="gradient" size="lg">{isLogin ? 'Se connecter' : 'Créer mon compte'}</UltraButton>
          </form>
          <motion.button type="button" onClick={() => { setIsLogin(!isLogin); trigger('light'); }} className="w-full text-center text-sm text-muted-foreground hover:text-primary py-2" whileHover={{ scale: 1.02 }}>
            {isLogin ? <><span>Pas encore de compte ? </span><span className="font-semibold text-primary">Créer un compte</span></> : <><span>Déjà inscrit ? </span><span className="font-semibold text-primary">Se connecter</span></>}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernAuthUI;

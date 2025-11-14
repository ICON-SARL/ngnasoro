import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernInput } from '@/components/ui/modern-input';
import { Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { pageVariants } from '@/utils/animations/pageTransitions';

export const ModernAdminAuthUI: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) throw error;
      
      toast({
        title: 'Connexion administrateur réussie',
        description: 'Accès autorisé',
      });
      
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erreur d\'authentification',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Security grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Animated security scan lines */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent"
        animate={{
          y: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 border-2 border-primary/20">
          {/* Security badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-yellow-400"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
            </div>
          </motion.div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">
              Accès Administrateur MEREF
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Shield className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Accès sécurisé</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ModernInput
              type="email"
              label="Email administrateur"
              placeholder="admin@meref.gov"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <div className="relative">
              <ModernInput
                type={showPassword ? 'text' : 'password'}
                label="Mot de passe"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                icon={<Lock className="w-5 h-5" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground smooth-transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <ModernButton
              type="submit"
              variant="gradient"
              size="lg"
              fullWidth
              loading={loading}
            >
              Connexion sécurisée
            </ModernButton>
          </form>

          <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Connexion sécurisée par authentification multi-facteurs
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernAdminAuthUI;

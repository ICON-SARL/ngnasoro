import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernInput } from '@/components/ui/modern-input';
import { Mail, Lock, Building2, Eye, EyeOff } from 'lucide-react';
import { pageVariants } from '@/utils/animations/pageTransitions';

export const ModernSfdAdminAuthUI: React.FC = () => {
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
        title: 'Connexion SFD réussie',
        description: 'Bienvenue sur votre espace SFD',
      });
      
      navigate('/sfd/dashboard');
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-green-50 dark:from-blue-950/20 dark:via-background dark:to-green-950/20" />
      
      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-20"
            style={{
              width: 300 + i * 100,
              height: 300 + i * 100,
              background: i === 0 ? 'hsl(var(--primary))' : i === 1 ? 'hsl(var(--accent))' : 'hsl(var(--info))',
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              delay: i * 2,
            }}
            initial={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-center mb-2">
            Espace SFD
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Connectez-vous à votre espace d'administration
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ModernInput
              type="email"
              label="Email SFD"
              placeholder="admin@sfd.com"
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
              Se connecter
            </ModernButton>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/auth"
              className="text-sm text-muted-foreground hover:text-primary smooth-transition"
            >
              Accès client
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernSfdAdminAuthUI;

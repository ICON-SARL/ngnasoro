import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { UltraInput } from '@/components/ui/ultra-modern/UltraInput';
import { UltraButton } from '@/components/ui/ultra-modern/UltraButton';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { SuccessConfetti } from '@/components/ui/SuccessConfetti';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface UnifiedModernAuthUIProps {
  mode?: 'client' | 'admin' | 'sfd_admin';
}

const UnifiedModernAuthUI: React.FC<UnifiedModernAuthUIProps> = ({ mode = 'client' }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    acceptTerms: false
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user && userRole) {
      const redirectMap: Record<string, string> = {
        admin: '/super-admin-dashboard',
        sfd_admin: '/agency-dashboard',
        client: '/mobile-flow/dashboard',
        user: '/sfd-selection'
      };
      navigate(redirectMap[userRole] || '/mobile-flow/dashboard');
    }
  }, [user, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;

        setShowConfetti(true);
        toast({ 
          title: '✅ Connexion réussie', 
          description: 'Redirection en cours...' 
        });
      } else {
        // REGISTER
        if (!formData.acceptTerms) {
          throw new Error('Vous devez accepter les conditions d\'utilisation');
        }

        const clientCode = `CLI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        // Enregistrer le code client et l'acceptation des CGU dans le profil
        if (data.user) {
          await supabase
            .from('profiles')
            .update({
              client_code: clientCode,
              terms_accepted_at: new Date().toISOString(),
              terms_version: '1.0'
            })
            .eq('id', data.user.id);
        }

        setShowConfetti(true);
        toast({
          title: '✅ Inscription réussie',
          description: 'Bienvenue sur N\'GNA SÔRÔ!'
        });
      }
    } catch (error: any) {
      toast({
        title: '❌ Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const modeConfig = {
    client: {
      title: isLogin ? 'Bienvenue' : 'Créer un compte',
      subtitle: 'Microfinance digitale',
      gradient: 'from-[#0D6A51] via-[#0F7C5F] to-[#FFAB2E]'
    },
    admin: {
      title: isLogin ? 'Espace MEREF' : 'Nouveau compte MEREF',
      subtitle: 'Administration centrale',
      gradient: 'from-blue-600 via-blue-700 to-purple-600'
    },
    sfd_admin: {
      title: isLogin ? 'Espace SFD' : 'Nouveau compte SFD',
      subtitle: 'Gestion de votre agence',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600'
    }
  };

  const config = modeConfig[mode];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.gradient} flex items-center justify-center p-4 relative overflow-hidden`}>
      <ParticleBackground particleCount={50} />
      
      {/* Blobs animés */}
      <div className="absolute inset-0 opacity-30">
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-white/20 rounded-full mix-blend-overlay filter blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#FFAB2E]/30 rounded-full mix-blend-overlay filter blur-3xl"
          animate={{ 
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <AnimatePresence>
        {showConfetti && <SuccessConfetti onComplete={() => setShowConfetti(false)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20">
          
          {/* Logo */}
          <div className="text-center space-y-3">
            <AnimatedLogo size={100} withGlow withPulse />
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-[#0D6A51] to-[#FFAB2E] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {config.title}
            </motion.h1>
            <p className="text-muted-foreground">
              {config.subtitle}
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <UltraInput
                      type="text"
                      label="Nom complet"
                      icon={<User size={20} />}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required={!isLogin}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <UltraInput
                      type="tel"
                      label="Téléphone"
                      icon={<Phone size={20} />}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+223 70 00 00 00"
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <UltraInput
              type="email"
              label="Email"
              icon={<Mail size={20} />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <UltraInput
              type="password"
              label="Mot de passe"
              icon={<Lock size={20} />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            {/* Checkbox CGU (UNIQUEMENT pour inscription) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3 p-4 bg-primary/5 rounded-xl border border-primary/20"
              >
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, acceptTerms: checked as boolean })
                  }
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  J'accepte les{" "}
                  <a href="/legal/terms" className="underline text-[#0D6A51] font-medium hover:text-[#0F7C5F]" target="_blank" rel="noopener noreferrer">
                    Conditions d'utilisation
                  </a>{" "}
                  et la{" "}
                  <a href="/legal/privacy" className="underline text-[#0D6A51] font-medium hover:text-[#0F7C5F]" target="_blank" rel="noopener noreferrer">
                    Politique de confidentialité
                  </a>
                </Label>
              </motion.div>
            )}

            <UltraButton
              type="submit"
              loading={loading}
              fullWidth
              variant="gradient"
              size="lg"
              disabled={!isLogin && !formData.acceptTerms}
            >
              {isLogin ? 'Se connecter' : 'Créer mon compte'}
            </UltraButton>
          </form>

          {/* Toggle Login/Register */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>Pas encore de compte ? <span className="font-semibold">S'inscrire</span></>
              ) : (
                <>Déjà inscrit ? <span className="font-semibold">Se connecter</span></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UnifiedModernAuthUI;

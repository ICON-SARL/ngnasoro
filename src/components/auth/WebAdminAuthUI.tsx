import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, Shield, Building2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { Link } from 'react-router-dom';

interface WebAdminAuthUIProps {
  mode: 'admin' | 'sfd_admin';
}

const WebAdminAuthUI: React.FC<WebAdminAuthUIProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAdmin = mode === 'admin';
  
  const config = {
    admin: {
      title: 'Administration MEREF',
      subtitle: 'Portail de supervision nationale',
      gradient: 'from-[hsl(var(--primary))] via-[hsl(162,74%,20%)] to-[hsl(162,74%,15%)]',
      accentGradient: 'from-primary to-primary/80',
      icon: Shield,
      redirectPath: '/super-admin-dashboard',
      requiredRole: 'admin',
    },
    sfd_admin: {
      title: 'Espace SFD',
      subtitle: 'Gestion de votre agence de microfinance',
      gradient: 'from-[hsl(var(--primary))] via-[hsl(162,74%,28%)] to-[hsl(var(--accent))]',
      accentGradient: 'from-primary to-accent',
      icon: Building2,
      redirectPath: '/agency-dashboard',
      requiredRole: 'sfd_admin',
    },
  };

  const currentConfig = config[mode];
  const IconComponent = currentConfig.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Échec de la connexion');
      }

      // 2. Verify user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        throw new Error('Accès non autorisé - Rôle non trouvé');
      }

      // 3. Check if user has required role
      const hasRequiredRole = roleData.role === currentConfig.requiredRole || 
        (mode === 'sfd_admin' && roleData.role === 'admin'); // Admins can access SFD too

      if (!hasRequiredRole) {
        await supabase.auth.signOut();
        throw new Error(`Accès réservé aux ${isAdmin ? 'administrateurs MEREF' : 'administrateurs SFD'}`);
      }

      // 4. Log successful login
      await supabase.from('audit_logs').insert({
        user_id: authData.user.id,
        action: `${mode}_login`,
        category: 'authentication',
        severity: 'info',
        status: 'success',
        details: { email: authData.user.email, role: roleData.role },
      });

      toast({
        title: 'Connexion réussie',
        description: `Bienvenue dans l'espace ${isAdmin ? 'MEREF' : 'SFD'}`,
      });

      // 5. Redirect to dashboard
      navigate(currentConfig.redirectPath);

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Une erreur est survenue');
      
      toast({
        title: 'Erreur de connexion',
        description: err.message || 'Vérifiez vos identifiants',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${currentConfig.gradient} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/5 to-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Back to home link */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6"
      >
        <Link
          to="/landing"
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Retour à l'accueil</span>
        </Link>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-black/20 p-10 border border-white/50">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentConfig.accentGradient} flex items-center justify-center shadow-lg`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground mb-2"
            >
              {currentConfig.title}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm"
            >
              {currentConfig.subtitle}
            </motion.p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
            >
              <p className="text-destructive text-sm text-center">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-foreground mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-foreground mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Forgot password link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex justify-end"
            >
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </motion.div>

            {/* Submit button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r ${currentConfig.accentGradient} shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">Accès sécurisé</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Alternative login link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center"
          >
            {isAdmin ? (
              <Link
                to="/sfd/auth"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Vous êtes administrateur SFD ? <span className="font-medium text-primary">Connectez-vous ici</span>
              </Link>
            ) : (
              <Link
                to="/admin/auth"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Accès MEREF ? <span className="font-medium text-primary">Connectez-vous ici</span>
              </Link>
            )}
          </motion.div>

          {/* Client access link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-4"
          >
            <Link
              to="/auth"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Accès client mobile ? <span className="font-medium text-primary">Par ici</span>
            </Link>
          </motion.div>

          {/* Legal links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8 pt-6 border-t border-border flex justify-center gap-4 text-xs text-muted-foreground"
          >
            <Link to="/legal/cgu" className="hover:text-primary transition-colors">
              Conditions d'utilisation
            </Link>
            <span>•</span>
            <Link to="/legal/privacy" className="hover:text-primary transition-colors">
              Politique de confidentialité
            </Link>
          </motion.div>
        </div>

        {/* Logo under card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center mt-6"
        >
          <AnimatedLogo size={40} className="opacity-80" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WebAdminAuthUI;

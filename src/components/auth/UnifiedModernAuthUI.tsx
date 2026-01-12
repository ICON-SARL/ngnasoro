import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { UltraInput } from '@/components/ui/ultra-modern/UltraInput';
import { UltraButton } from '@/components/ui/ultra-modern/UltraButton';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { SuccessConfetti } from '@/components/ui/SuccessConfetti';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MALI_COUNTRY_CODE } from '@/lib/constants';

interface UnifiedModernAuthUIProps {
  mode?: 'client' | 'admin' | 'sfd_admin';
}

type AuthStep = 'phone' | 'otp';

const UnifiedModernAuthUI: React.FC<UnifiedModernAuthUIProps> = ({ mode = 'client' }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<AuthStep>('phone');
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    otp: '',
    acceptTerms: false
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole } = useAuth();

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Redirect if already logged in
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

  const getFullPhoneNumber = () => {
    const digits = formData.phone.replace(/\s/g, '');
    return `${MALI_COUNTRY_CODE}${digits}`;
  };

  const handleSendOtp = async () => {
    if (!formData.phone || formData.phone.replace(/\s/g, '').length < 8) {
      toast({
        title: 'Numéro invalide',
        description: 'Veuillez entrer un numéro de téléphone valide',
        variant: 'destructive'
      });
      return;
    }

    // For registration, validate required fields
    if (!isLogin) {
      if (!formData.fullName.trim()) {
        toast({
          title: 'Nom requis',
          description: 'Veuillez entrer votre nom complet',
          variant: 'destructive'
        });
        return;
      }
      if (!formData.acceptTerms) {
        toast({
          title: 'Conditions requises',
          description: 'Veuillez accepter les conditions d\'utilisation',
          variant: 'destructive'
        });
        return;
      }
    }

    setLoading(true);
    
    try {
      const fullPhone = getFullPhoneNumber();
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
        options: !isLogin ? {
          data: {
            full_name: formData.fullName
          }
        } : undefined
      });

      if (error) throw error;

      setStep('otp');
      setResendCooldown(60);
      toast({
        title: '📱 Code envoyé',
        description: `Un code de vérification a été envoyé au ${fullPhone}`
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer le code',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (formData.otp.length !== 6) {
      toast({
        title: 'Code incomplet',
        description: 'Veuillez entrer le code à 6 chiffres',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const fullPhone = getFullPhoneNumber();
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: formData.otp,
        type: 'sms'
      });

      if (error) throw error;

      // For new users, update profile with additional data
      if (!isLogin && data.user) {
        const clientCode = `CLI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        await supabase
          .from('profiles')
          .update({
            full_name: formData.fullName,
            phone: fullPhone,
            client_code: clientCode,
            terms_accepted_at: new Date().toISOString(),
            terms_version: '1.0'
          })
          .eq('id', data.user.id);
      }

      setShowConfetti(true);
      toast({
        title: '✅ Connexion réussie',
        description: 'Bienvenue sur N\'GNA SÔRÔ!'
      });
    } catch (error: any) {
      toast({
        title: 'Code invalide',
        description: error.message || 'Le code est incorrect ou expiré',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    await handleSendOtp();
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setFormData(prev => ({ ...prev, otp: '' }));
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setStep('phone');
    setFormData({
      fullName: '',
      phone: '',
      otp: '',
      acceptTerms: false
    });
  };

  const modeConfig = {
    client: {
      title: step === 'otp' 
        ? 'Vérification' 
        : isLogin ? 'Bienvenue' : 'Créer un compte',
      subtitle: step === 'otp' 
        ? `Code envoyé au ${getFullPhoneNumber()}`
        : 'Microfinance digitale',
      gradient: 'from-[#0D6A51] via-[#0F7C5F] to-[#FFAB2E]'
    },
    admin: {
      title: step === 'otp' 
        ? 'Vérification' 
        : isLogin ? 'Espace MEREF' : 'Nouveau compte',
      subtitle: step === 'otp' 
        ? `Code envoyé au ${getFullPhoneNumber()}`
        : 'Administration centrale',
      gradient: 'from-blue-600 via-blue-700 to-purple-600'
    },
    sfd_admin: {
      title: step === 'otp' 
        ? 'Vérification' 
        : isLogin ? 'Espace SFD' : 'Nouveau compte',
      subtitle: step === 'otp' 
        ? `Code envoyé au ${getFullPhoneNumber()}`
        : 'Gestion de votre agence',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600'
    }
  };

  const config = modeConfig[mode];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.gradient} flex items-center justify-center p-4 relative overflow-hidden`}>
      {/* Single subtle animated blob */}
      <motion.div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/10 rounded-full mix-blend-overlay filter blur-3xl"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <AnimatePresence>
        {showConfetti && <SuccessConfetti onComplete={() => setShowConfetti(false)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl p-8 space-y-6 border border-white/30">
          
          {/* Logo and title */}
          <div className="text-center space-y-3">
            <motion.div 
              className="flex justify-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <AnimatedLogo 
                size={100} 
                withGlow={false}
                withPulse 
                className="mx-auto"
              />
            </motion.div>
          
            <motion.h1 
              key={config.title}
              className="text-2xl font-bold bg-gradient-to-r from-[#0D6A51] to-[#FFAB2E] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {config.title}
            </motion.h1>
            <motion.p 
              key={config.subtitle}
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {config.subtitle}
            </motion.p>
          </div>

          {/* Form content */}
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Name field for registration */}
                {!isLogin && (
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
                      required
                      placeholder="Amadou Diallo"
                    />
                  </motion.div>
                )}

                {/* Phone input */}
                <PhoneInput
                  label="Numéro de téléphone"
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                />

                {/* Terms checkbox for registration */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-primary/5 rounded-2xl border border-primary/20"
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={formData.acceptTerms}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, acceptTerms: checked as boolean })
                        }
                        className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label 
                        htmlFor="terms" 
                        className="text-sm leading-relaxed cursor-pointer text-muted-foreground"
                      >
                        J'accepte les{' '}
                        <a 
                          href="/legal/terms" 
                          className="text-primary font-medium underline" 
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                        >
                          conditions d'utilisation
                        </a>
                        {' '}et la{' '}
                        <a 
                          href="/legal/privacy" 
                          className="text-primary font-medium underline" 
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                        >
                          politique de confidentialité
                        </a>
                      </Label>
                    </div>
                  </motion.div>
                )}

                {/* Submit button */}
                <UltraButton
                  type="button"
                  onClick={handleSendOtp}
                  loading={loading}
                  fullWidth
                  variant="gradient"
                  size="lg"
                  disabled={!isLogin && !formData.acceptTerms}
                  className="h-14 text-base font-semibold"
                >
                  Recevoir le code
                </UltraButton>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* OTP Input */}
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Entrez le code à 6 chiffres reçu par SMS
                  </p>
                  
                  <InputOTP
                    maxLength={6}
                    value={formData.otp}
                    onChange={(value) => setFormData({ ...formData, otp: value })}
                    className="gap-2"
                  >
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot 
                          key={index}
                          index={index} 
                          className="w-12 h-14 text-xl font-bold rounded-xl border-2 border-border/50 focus:border-primary"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* Verify button */}
                <UltraButton
                  type="button"
                  onClick={handleVerifyOtp}
                  loading={loading}
                  fullWidth
                  variant="gradient"
                  size="lg"
                  className="h-14 text-base font-semibold"
                >
                  Vérifier et continuer
                </UltraButton>

                {/* Back and resend links */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleBackToPhone}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Modifier le numéro
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Login/Register - only show on phone step */}
          {step === 'phone' && (
            <div className="text-center pt-4 border-t border-border/20">
              <p className="text-sm text-muted-foreground mb-2">
                {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}
              </p>
              <button
                type="button"
                onClick={handleToggleMode}
                className="text-primary font-semibold hover:underline transition-all"
              >
                {isLogin ? "Créer un compte →" : "← Se connecter"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UnifiedModernAuthUI;

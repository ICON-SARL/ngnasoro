import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Lock, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { UltraInput } from '@/components/ui/ultra-modern/UltraInput';
import { UltraButton } from '@/components/ui/ultra-modern/UltraButton';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { SuccessConfetti } from '@/components/ui/SuccessConfetti';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { PinInput } from '@/components/ui/PinInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MALI_COUNTRY_CODE } from '@/lib/constants';

interface UnifiedModernAuthUIProps {
  mode?: 'client' | 'admin' | 'sfd_admin';
}

type AuthStep = 'phone' | 'pin' | 'setup_pin' | 'confirm_pin';

const UnifiedModernAuthUI: React.FC<UnifiedModernAuthUIProps> = ({ mode = 'client' }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<AuthStep>('phone');
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [pinError, setPinError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    pin: '',
    confirmPin: '',
    acceptTerms: false
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole } = useAuth();

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

  const handleCheckPhone = async () => {
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
    setPinError('');
    
    try {
      const fullPhone = getFullPhoneNumber();
      
      // Use read-only lookup function (no side effects on pin_attempts)
      const { data, error } = await supabase.rpc('get_pin_login_state', {
        p_phone: fullPhone
      });

      if (error) throw error;

      const result = data as { 
        exists: boolean; 
        user_id: string | null;
        needs_setup: boolean; 
        locked_until: string | null;
      };

      if (result.locked_until) {
        const lockTime = new Date(result.locked_until);
        toast({
          title: 'Compte temporairement bloqué',
          description: `Réessayez après ${lockTime.toLocaleTimeString('fr-FR')}`,
          variant: 'destructive'
        });
        return;
      }

      if (!result.exists) {
        if (isLogin) {
          toast({
            title: 'Compte non trouvé',
            description: 'Aucun compte associé à ce numéro. Créez un compte.',
            variant: 'destructive'
          });
        } else {
          // For new registration, go to PIN setup
          setStep('setup_pin');
        }
        return;
      }

      if (result.needs_setup && result.user_id) {
        // User exists but no PIN set
        setUserId(result.user_id);
        setStep('setup_pin');
        toast({
          title: 'Configuration du PIN',
          description: 'Créez votre code PIN à 4 chiffres'
        });
        return;
      }

      // User exists with PIN configured, go to PIN entry
      setStep('pin');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de vérifier le numéro',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async () => {
    if (formData.pin.length !== 4) {
      setPinError('Veuillez entrer 4 chiffres');
      return;
    }

    setLoading(true);
    setPinError('');

    try {
      const fullPhone = getFullPhoneNumber();
      
      // Call edge function to verify PIN and get session tokens
      const { data: response, error: fetchError } = await supabase.functions.invoke('pin-auth-session', {
        body: { phone: fullPhone, pin: formData.pin }
      });

      if (fetchError) throw fetchError;

      // Handle locked account
      if (response.locked_until) {
        const lockTime = new Date(response.locked_until);
        setPinError(`Compte bloqué jusqu'à ${lockTime.toLocaleTimeString('fr-FR')}`);
        return;
      }

      // Handle needs setup
      if (response.needs_setup && response.user_id) {
        setUserId(response.user_id);
        setStep('setup_pin');
        toast({
          title: 'Configuration du PIN',
          description: 'Créez votre code PIN à 4 chiffres'
        });
        return;
      }

      // Handle wrong PIN
      if (!response.success) {
        if (response.attempts_remaining !== undefined) {
          setAttemptsRemaining(response.attempts_remaining);
          setPinError(`PIN incorrect. ${response.attempts_remaining} essai(s) restant(s)`);
        } else {
          setPinError(response.error || 'PIN incorrect');
        }
        setFormData(prev => ({ ...prev, pin: '' }));
        return;
      }

      // Success! Set the session with returned tokens
      const { access_token, refresh_token } = response;
      
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token
      });

      if (sessionError) {
        console.error('Error setting session:', sessionError);
        throw new Error('Erreur de création de session');
      }

      setShowConfetti(true);
      toast({
        title: '✅ Connexion réussie',
        description: 'Bienvenue sur N\'GNA SÔRÔ!'
      });

      // AuthContext will pick up the session and redirect based on role
    } catch (error: any) {
      console.error('PIN verification error:', error);
      setPinError(error.message || 'Erreur de vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupPin = async () => {
    if (formData.pin.length !== 4) {
      setPinError('Le PIN doit contenir 4 chiffres');
      return;
    }

    // Move to confirm step
    setStep('confirm_pin');
    setPinError('');
  };

  const handleConfirmPin = async () => {
    if (formData.confirmPin !== formData.pin) {
      setPinError('Les codes PIN ne correspondent pas');
      setFormData(prev => ({ ...prev, confirmPin: '' }));
      return;
    }

    setLoading(true);
    setPinError('');

    try {
      const fullPhone = getFullPhoneNumber();

      if (userId) {
        // Existing user without PIN - just set the PIN
        const { data, error } = await supabase.rpc('set_user_pin', {
          p_user_id: userId,
          p_pin: formData.pin
        });

        if (error) throw error;

        const result = data as { success: boolean; error?: string };
        
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de la configuration du PIN');
        }

        setShowConfetti(true);
        toast({
          title: '✅ PIN configuré',
          description: 'Vous pouvez maintenant vous connecter'
        });

        // Reset and go back to phone step for login
        setTimeout(() => {
          setStep('phone');
          setFormData(prev => ({ ...prev, pin: '', confirmPin: '' }));
          setIsLogin(true);
        }, 1500);
      } else {
        // New user registration - create account first
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          phone: fullPhone,
          password: formData.pin, // Use PIN as initial password
          options: {
            data: {
              full_name: formData.fullName,
              phone: fullPhone
            }
          }
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // Set the PIN for the new user
          const { error: pinError } = await supabase.rpc('set_user_pin', {
            p_user_id: signUpData.user.id,
            p_pin: formData.pin
          });

          if (pinError) {
            console.warn('PIN setup warning:', pinError);
          }

          // Update profile
          await supabase
            .from('profiles')
            .update({
              full_name: formData.fullName,
              phone: fullPhone,
              terms_accepted_at: new Date().toISOString(),
              terms_version: '1.0'
            })
            .eq('id', signUpData.user.id);
        }

        setShowConfetti(true);
        toast({
          title: '✅ Compte créé',
          description: 'Bienvenue sur N\'GNA SÔRÔ!'
        });
      }
    } catch (error: any) {
      setPinError(error.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setFormData(prev => ({ ...prev, pin: '', confirmPin: '' }));
    setPinError('');
    setAttemptsRemaining(null);
  };

  const handleBackToSetup = () => {
    setStep('setup_pin');
    setFormData(prev => ({ ...prev, confirmPin: '' }));
    setPinError('');
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setStep('phone');
    setFormData({
      fullName: '',
      phone: '',
      pin: '',
      confirmPin: '',
      acceptTerms: false
    });
    setPinError('');
    setUserId(null);
  };

  const getStepConfig = () => {
    switch (step) {
      case 'pin':
        return {
          title: 'Code PIN',
          subtitle: `Téléphone: ${getFullPhoneNumber()}`,
          icon: <Lock size={20} />
        };
      case 'setup_pin':
        return {
          title: 'Créer votre PIN',
          subtitle: 'Choisissez un code à 4 chiffres',
          icon: <KeyRound size={20} />
        };
      case 'confirm_pin':
        return {
          title: 'Confirmer le PIN',
          subtitle: 'Entrez à nouveau votre code',
          icon: <KeyRound size={20} />
        };
      default:
        return {
          title: isLogin ? 'Bienvenue' : 'Créer un compte',
          subtitle: 'Microfinance digitale',
          icon: null
        };
    }
  };

  const stepConfig = getStepConfig();

  const modeConfig = {
    client: {
      gradient: 'from-[#0D6A51] via-[#0F7C5F] to-[#FFAB2E]'
    },
    admin: {
      gradient: 'from-blue-600 via-blue-700 to-purple-600'
    },
    sfd_admin: {
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
        <div className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 rounded-[32px] shadow-2xl shadow-black/15 p-10 space-y-6 border border-white/40">
          
          {/* Logo and title */}
          <div className="text-center space-y-3">
            <motion.div 
              className="flex justify-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <AnimatedLogo 
                size={120} 
                withGlow={false}
                withPulse 
                className="mx-auto"
              />
            </motion.div>
          
            <motion.h1 
              key={stepConfig.title}
              className="text-2xl font-bold bg-gradient-to-r from-[#0D6A51] to-[#FFAB2E] bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {stepConfig.title}
            </motion.h1>
            <motion.p 
              key={stepConfig.subtitle}
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {stepConfig.subtitle}
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
                  onClick={handleCheckPhone}
                  loading={loading}
                  fullWidth
                  variant="gradient"
                  size="lg"
                  disabled={!isLogin && !formData.acceptTerms}
                  className="h-14 text-base font-semibold"
                >
                  Continuer
                </UltraButton>
              </motion.div>
            ) : step === 'pin' ? (
              <motion.div
                key="pin-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* PIN Input */}
                <PinInput
                  value={formData.pin}
                  onChange={(value) => {
                    setFormData({ ...formData, pin: value });
                    setPinError('');
                  }}
                  length={4}
                  error={pinError}
                  autoFocus
                />

                {/* Attempts warning */}
                {attemptsRemaining !== null && attemptsRemaining <= 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-center"
                  >
                    <p className="text-sm text-destructive font-medium">
                      ⚠️ Attention: {attemptsRemaining} tentative(s) restante(s)
                    </p>
                  </motion.div>
                )}

                {/* Verify button */}
                <UltraButton
                  type="button"
                  onClick={handleVerifyPin}
                  loading={loading}
                  fullWidth
                  variant="gradient"
                  size="lg"
                  disabled={formData.pin.length !== 4}
                  className="h-14 text-base font-semibold"
                >
                  Se connecter
                </UltraButton>

                {/* Forgot PIN and Back links */}
                <div className="flex flex-col items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      toast({
                        title: 'Réinitialisation du PIN',
                        description: 'Contactez votre agence SFD ou le support au +223 XX XX XX XX pour réinitialiser votre code PIN.',
                        duration: 8000
                      });
                    }}
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    PIN oublié ?
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToPhone}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Modifier le numéro
                  </button>
                </div>
              </motion.div>
            ) : step === 'setup_pin' ? (
              <motion.div
                key="setup-pin-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* PIN Setup Input */}
                <PinInput
                  label="Choisissez votre code PIN"
                  value={formData.pin}
                  onChange={(value) => {
                    setFormData({ ...formData, pin: value });
                    setPinError('');
                  }}
                  length={4}
                  error={pinError}
                  autoFocus
                />

                <p className="text-xs text-muted-foreground text-center">
                  Ce code vous permettra de vous connecter rapidement
                </p>

                {/* Continue button */}
                <UltraButton
                  type="button"
                  onClick={handleSetupPin}
                  loading={loading}
                  fullWidth
                  variant="gradient"
                  size="lg"
                  disabled={formData.pin.length !== 4}
                  className="h-14 text-base font-semibold"
                >
                  Continuer
                </UltraButton>

                {/* Back link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleBackToPhone}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
                  >
                    <ArrowLeft size={16} />
                    Retour
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirm-pin-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* PIN Confirm Input */}
                <PinInput
                  label="Confirmez votre code PIN"
                  value={formData.confirmPin}
                  onChange={(value) => {
                    setFormData({ ...formData, confirmPin: value });
                    setPinError('');
                  }}
                  length={4}
                  error={pinError}
                  autoFocus
                />

                {/* Confirm button */}
                <UltraButton
                  type="button"
                  onClick={handleConfirmPin}
                  loading={loading}
                  fullWidth
                  variant="gradient"
                  size="lg"
                  disabled={formData.confirmPin.length !== 4}
                  className="h-14 text-base font-semibold"
                >
                  {userId ? 'Enregistrer le PIN' : 'Créer mon compte'}
                </UltraButton>

                {/* Back link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleBackToSetup}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
                  >
                    <ArrowLeft size={16} />
                    Modifier le PIN
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

          {/* Legal links - always visible */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/10 flex items-center justify-center gap-2">
            <a 
              href="/legal/terms" 
              className="hover:text-primary hover:underline transition-colors"
              target="_blank"
            >
              Conditions d'utilisation
            </a>
            <span className="text-border">•</span>
            <a 
              href="/legal/privacy" 
              className="hover:text-primary hover:underline transition-colors"
              target="_blank"
            >
              Politique de confidentialité
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UnifiedModernAuthUI;

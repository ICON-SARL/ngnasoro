import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Lock, KeyRound, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { SuccessConfetti } from '@/components/ui/SuccessConfetti';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { SecurePinPad } from '@/components/ui/SecurePinPad';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MALI_COUNTRY_CODE } from '@/lib/constants';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
    email: '',
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

  const getFullPhoneNumber = useCallback(() => {
    const digits = formData.phone.replace(/\s/g, '');
    return `${MALI_COUNTRY_CODE}${digits}`;
  }, [formData.phone]);

  const handleCheckPhone = useCallback(async () => {
    if (!formData.phone || formData.phone.replace(/\s/g, '').length < 8) {
      toast({ title: 'Numéro invalide', description: 'Veuillez entrer un numéro de téléphone valide', variant: 'destructive' });
      return;
    }
    if (!isLogin) {
      if (!formData.fullName.trim()) {
        toast({ title: 'Nom requis', description: 'Veuillez entrer votre nom complet', variant: 'destructive' });
        return;
      }
      if (!formData.acceptTerms) {
        toast({ title: 'Conditions requises', description: "Veuillez accepter les conditions d'utilisation", variant: 'destructive' });
        return;
      }
    }

    setLoading(true);
    setPinError('');
    
    try {
      const fullPhone = getFullPhoneNumber();
      const { data, error } = await supabase.rpc('get_pin_login_state', { p_phone: fullPhone });
      if (error) throw error;

      const result = data as { exists: boolean; user_id: string | null; needs_setup: boolean; locked_until: string | null };

      if (result.locked_until) {
        const lockTime = new Date(result.locked_until);
        toast({ title: 'Compte temporairement bloqué', description: `Réessayez après ${lockTime.toLocaleTimeString('fr-FR')}`, variant: 'destructive' });
        return;
      }

      if (!result.exists) {
        if (isLogin) {
          toast({ title: 'Compte non trouvé', description: 'Aucun compte associé à ce numéro. Créez un compte.', variant: 'destructive' });
        } else {
          setStep('setup_pin');
        }
        return;
      }

      if (result.needs_setup && result.user_id) {
        setUserId(result.user_id);
        setStep('setup_pin');
        toast({ title: 'Configuration du PIN', description: 'Créez votre code PIN à 4 chiffres' });
        return;
      }

      setStep('pin');
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Impossible de vérifier le numéro', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [formData, isLogin, getFullPhoneNumber, toast]);

  const handleVerifyPin = useCallback(async (pinValue?: string) => {
    const pin = pinValue ?? formData.pin;
    if (pin.length !== 4) { setPinError('Veuillez entrer 4 chiffres'); return; }
    setLoading(true);
    setPinError('');
    try {
      const fullPhone = getFullPhoneNumber();
      const { data: response, error: fetchError } = await supabase.functions.invoke('pin-auth-session', {
        body: { phone: fullPhone, pin }
      });
      if (fetchError) throw new Error('Erreur de connexion au serveur. Veuillez réessayer.');
      if (!response) throw new Error('Réponse serveur invalide');

      if (response.locked_until) {
        const lockTime = new Date(response.locked_until);
        setPinError(`Compte bloqué jusqu'à ${lockTime.toLocaleTimeString('fr-FR')}`);
        return;
      }
      if (response.needs_setup && response.user_id) {
        setUserId(response.user_id);
        setStep('setup_pin');
        toast({ title: 'Configuration du PIN', description: 'Créez votre code PIN à 4 chiffres' });
        return;
      }
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

      const { access_token, refresh_token } = response;
      if (!access_token || !refresh_token) throw new Error('Tokens de session manquants');
      
      const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
      if (sessionError) throw new Error('Erreur de création de session');

      setShowConfetti(true);
      toast({ title: '✅ Connexion réussie', description: "Bienvenue sur N'GNA SÔRÔ!" });
      setTimeout(() => { navigate('/sfd-selection', { replace: true }); }, 1500);
    } catch (error: any) {
      console.error('PIN verification error:', error);
      const errorMessage = error.message || 'Erreur de vérification. Veuillez réessayer.';
      setPinError(errorMessage);
      toast({ title: 'Erreur de connexion', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [formData.pin, getFullPhoneNumber, navigate, toast]);

  const handleSetupPin = useCallback(async (pinValue?: string) => {
    const pin = pinValue ?? formData.pin;
    if (pin.length !== 4) { setPinError('Le PIN doit contenir 4 chiffres'); return; }
    setStep('confirm_pin');
    setPinError('');
  }, [formData.pin]);

  const handleConfirmPin = useCallback(async (confirmPinValue?: string) => {
    const confirmPin = confirmPinValue ?? formData.confirmPin;
    if (confirmPin !== formData.pin) {
      setPinError('Les codes PIN ne correspondent pas');
      setFormData(prev => ({ ...prev, confirmPin: '' }));
      return;
    }
    setLoading(true);
    setPinError('');
    try {
      const fullPhone = getFullPhoneNumber();
      if (userId) {
        const { data, error } = await supabase.rpc('set_user_pin', { p_user_id: userId, p_pin: formData.pin });
        if (error) throw error;
        const result = data as { success: boolean; error?: string };
        if (!result.success) throw new Error(result.error || 'Erreur lors de la configuration du PIN');
        setShowConfetti(true);
        toast({ title: '✅ PIN configuré', description: 'Vous pouvez maintenant vous connecter' });
        setTimeout(() => { setStep('phone'); setFormData(prev => ({ ...prev, pin: '', confirmPin: '' })); setIsLogin(true); }, 1500);
      } else {
        const { data: response, error: fetchError } = await supabase.functions.invoke('client-signup', {
          body: { fullName: formData.fullName.trim(), email: formData.email.trim() || undefined, phone: fullPhone, pin: formData.pin, acceptTerms: formData.acceptTerms }
        });
        if (fetchError) throw new Error('Erreur de connexion au serveur. Veuillez réessayer.');
        if (!response) throw new Error('Réponse serveur invalide');
        if (!response.success) throw new Error(response.error || 'Erreur lors de la création du compte');
        const { access_token, refresh_token } = response;
        if (!access_token || !refresh_token) throw new Error('Tokens de session manquants');
        const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
        if (sessionError) throw new Error('Erreur de création de session');
        setShowConfetti(true);
        toast({ title: '✅ Compte créé avec succès', description: "Bienvenue sur N'GNA SÔRÔ! Choisissez maintenant votre SFD." });
        setTimeout(() => { navigate('/sfd-selection', { replace: true }); }, 2000);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.message || 'Erreur lors de la création du compte';
      setPinError(errorMessage);
      toast({ title: 'Erreur', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [formData, userId, getFullPhoneNumber, navigate, toast]);

  const handleBackToPhone = useCallback(() => {
    setStep('phone');
    setFormData(prev => ({ ...prev, pin: '', confirmPin: '' }));
    setPinError('');
    setAttemptsRemaining(null);
  }, []);

  const handleBackToSetup = useCallback(() => {
    setStep('setup_pin');
    setFormData(prev => ({ ...prev, confirmPin: '' }));
    setPinError('');
  }, []);

  const handleToggleMode = useCallback(() => {
    setIsLogin(prev => !prev);
    setStep('phone');
    setFormData({ fullName: '', email: '', phone: '', pin: '', confirmPin: '', acceptTerms: false });
    setPinError('');
    setUserId(null);
  }, []);

  // Progress indicator: step index
  const stepIndex = step === 'phone' ? 0 : 1;
  const isPinStep = step !== 'phone';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0D6A51]">
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && <SuccessConfetti onComplete={() => setShowConfetti(false)} />}
      </AnimatePresence>

      {/* ===== TOP ZONE: Brand header with subtle pattern ===== */}
      <div className="relative flex-shrink-0 pt-10 pb-20 flex flex-col items-center justify-center">
        {/* SVG subtle pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <circle cx="85%" cy="20%" r="60" fill="none" stroke="white" strokeWidth="0.6" />
          <circle cx="85%" cy="20%" r="90" fill="none" stroke="white" strokeWidth="0.4" />
          <circle cx="12%" cy="80%" r="50" fill="none" stroke="white" strokeWidth="0.6" />
          <circle cx="12%" cy="80%" r="80" fill="none" stroke="white" strokeWidth="0.4" />
        </svg>

        {/* Compact logo on white circle + title */}
        <div className="relative z-10 flex flex-col items-center space-y-2">
          <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center">
            <AnimatedLogo 
              size={80} 
              withGlow={false}
              withPulse={false} 
              className="drop-shadow-sm"
            />
          </div>
          <h1 
            className="text-xl font-bold text-white tracking-[0.06em]"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
          >
            N'GNA SÔRÔ!
          </h1>
          <p className="text-white/70 text-xs font-semibold tracking-[0.2em] uppercase">
            Microfinance digitale
          </p>
        </div>
      </div>

      {/* ===== BOTTOM ZONE: White bottom-sheet ===== */}
      <div 
        className="relative flex-1 bg-white dark:bg-gray-950 rounded-t-[40px] -mt-8 z-10"
        style={{ 
          boxShadow: '0 -8px 30px rgba(0,0,0,0.08)',
          transform: 'translateZ(0)' 
        }}
      >
        {/* Progress bar with step labels */}
        <div className="px-8 pt-6 pb-2">
          <div className="flex items-center gap-3">
            {/* Step 1 indicator */}
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              stepIndex === 0 ? "bg-[#0D6A51] text-white" : "bg-[#0D6A51]/20 text-[#0D6A51]"
            )}>1</div>
            <div className="flex-1 h-[3px] rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div 
                className="h-full bg-[#0D6A51] rounded-full transition-all duration-500 ease-out"
                style={{ width: stepIndex === 0 ? '0%' : '100%' }}
              />
            </div>
            {/* Step 2 indicator */}
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              stepIndex === 1 ? "bg-[#0D6A51] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
            )}>2</div>
          </div>
          <div className="flex justify-between mt-2">
            <span className={cn(
              "text-xs font-medium transition-colors",
              stepIndex === 0 ? "text-[#0D6A51]" : "text-gray-400 dark:text-gray-500"
            )}>
              Téléphone
            </span>
            <span className={cn(
              "text-xs font-medium transition-colors",
              stepIndex === 1 ? "text-[#0D6A51]" : "text-gray-400 dark:text-gray-500"
            )}>
              Code PIN
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="px-8 pt-4 pb-6">
          {/* Step title */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {step === 'phone' 
                ? (isLogin ? 'Connexion' : 'Créer un compte')
                : step === 'pin' 
                  ? 'Code PIN'
                  : step === 'setup_pin'
                    ? 'Créer votre PIN'
                    : 'Confirmer le PIN'
              }
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {step === 'phone'
                ? (isLogin ? 'Entrez votre numéro de téléphone' : 'Remplissez vos informations')
                : step === 'pin'
                  ? `Téléphone: ${getFullPhoneNumber()}`
                  : step === 'setup_pin'
                    ? 'Choisissez un code à 4 chiffres'
                    : 'Entrez à nouveau votre code'
              }
            </p>
          </div>

          {/* Form steps with CSS transitions instead of AnimatePresence */}
          {step === 'phone' && (
            <div className="space-y-5 animate-fade-in">
              {/* Registration fields */}
              {!isLogin && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Amadou Diallo"
                        className="w-full h-[52px] pl-11 pr-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-[#0D6A51] focus:ring-2 focus:ring-[#0D6A51]/10 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email <span className="text-gray-400 font-normal">(optionnel)</span></label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="votre@email.com"
                        className="w-full h-[52px] pl-11 pr-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-[#0D6A51] focus:ring-2 focus:ring-[#0D6A51]/10 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Phone input */}
              <PhoneInput
                label="Numéro de téléphone"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
              />

              {/* Terms for registration */}
              {!isLogin && (
                <div className="p-3.5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                      className="mt-0.5 data-[state=checked]:bg-[#0D6A51] data-[state=checked]:border-[#0D6A51]"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer text-gray-600 dark:text-gray-400">
                      J'accepte les{' '}
                      <a href="/legal/cgu" className="text-[#0D6A51] font-medium underline" target="_blank" onClick={(e) => e.stopPropagation()}>
                        conditions d'utilisation
                      </a>
                      {' '}et la{' '}
                      <a href="/legal/privacy" className="text-[#0D6A51] font-medium underline" target="_blank" onClick={(e) => e.stopPropagation()}>
                        politique de confidentialité
                      </a>
                    </Label>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="button"
                onClick={handleCheckPhone}
                disabled={loading || (!isLogin && !formData.acceptTerms)}
                className={cn(
                  "w-full h-14 rounded-2xl font-semibold text-base text-white flex items-center justify-center gap-2",
                  "bg-[#0D6A51] hover:bg-[#0B5A44] active:scale-[0.97]",
                  "shadow-lg shadow-[#0D6A51]/20",
                  "transition-all duration-150 ease-out",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                  "will-change-transform"
                )}
              >
                {loading ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <>
                    Continuer
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              {/* Toggle Login/Register */}
              <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}
                </p>
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="text-[#0D6A51] font-semibold text-sm mt-1 hover:underline transition-all"
                >
                  {isLogin ? "Créer un compte →" : "← Se connecter"}
                </button>
              </div>
            </div>
          )}

          {step === 'pin' && (
            <div className="space-y-5 animate-fade-in">
              <SecurePinPad
                value={formData.pin}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, pin: value }));
                  setPinError('');
                  if (value.length === 4) {
                    setTimeout(() => handleVerifyPin(value), 300);
                  }
                }}
                length={4}
                error={pinError}
                title="Veuillez saisir votre code PIN"
                accentColor="#F5A623"
              />

              {attemptsRemaining !== null && attemptsRemaining <= 2 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    ⚠️ {attemptsRemaining} tentative(s) restante(s)
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex justify-center">
                  <Loader2 size={28} className="animate-spin text-[#0D6A51]" />
                </div>
              )}

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
                  className="text-sm text-[#0D6A51] hover:text-[#0B5A44] font-medium transition-colors"
                >
                  PIN oublié ?
                </button>
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Modifier le numéro
                </button>
              </div>
            </div>
          )}

          {step === 'setup_pin' && (
            <div className="space-y-5 animate-fade-in">
              <SecurePinPad
                value={formData.pin}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, pin: value }));
                  setPinError('');
                  if (value.length === 4) {
                    setTimeout(() => handleSetupPin(value), 300);
                  }
                }}
                length={4}
                error={pinError}
                title="Choisissez votre code PIN"
                subtitle="Ce code vous permettra de vous connecter rapidement"
                accentColor="#10B981"
              />
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mx-auto"
                >
                  <ArrowLeft size={16} />
                  Retour
                </button>
              </div>
            </div>
          )}

          {step === 'confirm_pin' && (
            <div className="space-y-5 animate-fade-in">
              <SecurePinPad
                value={formData.confirmPin}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, confirmPin: value }));
                  setPinError('');
                  if (value.length === 4) {
                    setTimeout(() => handleConfirmPin(value), 300);
                  }
                }}
                length={4}
                error={pinError}
                title="Confirmez votre code PIN"
                accentColor="#10B981"
              />
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleBackToSetup}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mx-auto"
                >
                  <ArrowLeft size={16} />
                  Modifier le PIN
                </button>
              </div>
            </div>
          )}

          {/* Legal links */}
          <div className="text-center text-xs text-gray-400 dark:text-gray-500 pt-6 flex items-center justify-center gap-2">
            <a href="/legal/cgu" className="hover:text-[#0D6A51] hover:underline transition-colors" target="_blank">
              CGU
            </a>
            <span>•</span>
            <a href="/legal/privacy" className="hover:text-[#0D6A51] hover:underline transition-colors" target="_blank">
              Confidentialité
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedModernAuthUI;

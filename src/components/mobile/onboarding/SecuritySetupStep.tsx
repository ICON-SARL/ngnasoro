import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModernButton } from '@/components/ui/modern-button';
import { Shield, Fingerprint, Lock, Check } from 'lucide-react';

interface SecuritySetupStepProps {
  onNext: () => void;
  onPrevious?: () => void;
}

export const SecuritySetupStep: React.FC<SecuritySetupStepProps> = ({
  onNext,
  onPrevious,
}) => {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pinCreated, setPinCreated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleComplete = () => {
    setShowConfetti(true);
    setTimeout(() => {
      onNext();
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col p-6 relative">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full"
              initial={{
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                opacity: 1,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0,
              }}
              transition={{
                duration: 1,
                delay: Math.random() * 0.3,
              }}
            />
          ))}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Sécurisez votre compte</h2>
        <p className="text-muted-foreground">
          Configurez vos options de sécurité
        </p>
      </div>

      <div className="flex-1 space-y-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Fingerprint className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Authentification biométrique</h3>
                  <p className="text-sm text-muted-foreground">
                    Utilisez votre empreinte digitale
                  </p>
                </div>
              </div>
              {biometricEnabled && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <Check className="w-6 h-6 text-success" />
                </motion.div>
              )}
            </div>
            <ModernButton
              variant={biometricEnabled ? 'secondary' : 'primary'}
              size="md"
              fullWidth
              onClick={() => setBiometricEnabled(!biometricEnabled)}
            >
              {biometricEnabled ? 'Activé' : 'Activer'}
            </ModernButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Code PIN</h3>
                  <p className="text-sm text-muted-foreground">
                    Créez un code à 4 chiffres
                  </p>
                </div>
              </div>
              {pinCreated && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <Check className="w-6 h-6 text-success" />
                </motion.div>
              )}
            </div>
            <ModernButton
              variant={pinCreated ? 'secondary' : 'primary'}
              size="md"
              fullWidth
              onClick={() => setPinCreated(!pinCreated)}
            >
              {pinCreated ? 'PIN créé' : 'Créer un PIN'}
            </ModernButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 bg-primary/5 border-primary/20"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
            <div className="text-sm">
              <p className="font-medium text-primary mb-1">
                Protection maximale
              </p>
              <p className="text-muted-foreground">
                Nous recommandons d'activer les deux options pour une sécurité optimale
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-4">
        {onPrevious && (
          <ModernButton
            variant="ghost"
            size="lg"
            onClick={onPrevious}
            className="flex-1"
          >
            Retour
          </ModernButton>
        )}
        <ModernButton
          variant="gradient"
          size="lg"
          onClick={handleComplete}
          disabled={!biometricEnabled && !pinCreated}
          className="flex-1"
        >
          Terminer
        </ModernButton>
      </div>
    </div>
  );
};

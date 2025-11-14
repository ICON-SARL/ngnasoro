import React from 'react';
import { motion } from 'framer-motion';
import { ModernButton } from '@/components/ui/modern-button';
import { Sparkles, Shield, Zap } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
        }}
        className="mb-8"
      >
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
          <span className="text-5xl font-bold text-white">N'G</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 gradient-text">
          Bienvenue chez N'GNA SÔRÔ
        </h1>
        <p className="text-lg text-muted-foreground">
          Votre partenaire financier de confiance
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md space-y-4 mb-12"
      >
        {[
          {
            icon: Shield,
            title: 'Sécurité garantie',
            description: 'Vos données sont protégées',
          },
          {
            icon: Zap,
            title: 'Rapide et simple',
            description: 'Gérez vos finances en un clin d\'œil',
          },
          {
            icon: Sparkles,
            title: 'Toujours disponible',
            description: 'Accédez à vos comptes 24/7',
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-xl bg-card hover-lift"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="w-full max-w-md"
      >
        <ModernButton
          variant="gradient"
          size="lg"
          fullWidth
          onClick={onNext}
        >
          Commencer
        </ModernButton>
      </motion.div>
    </div>
  );
};

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
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-br from-primary via-accent to-primary rounded-3xl opacity-20 blur-xl" />
          <div className="relative w-32 h-32 rounded-3xl bg-white shadow-2xl border-4 border-gray-100 flex items-center justify-center overflow-hidden">
            <img 
              src="/lovable-uploads/1fd2272c-2539-4f58-9841-15710204f204.png" 
              alt="N'GNA SÔRÔ Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-3 text-gray-900">
          Bienvenue chez <br />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            N'GNA SÔRÔ
          </span>
        </h1>
        <p className="text-base text-gray-600 font-medium">
          Votre partenaire de microfinance digitale
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
            className="flex items-start gap-4 p-5 rounded-2xl bg-white border-2 border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 shadow-sm">
              <feature.icon className="w-6 h-6 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
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

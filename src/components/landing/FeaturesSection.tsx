import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Shield, Zap, PiggyBank, Smartphone, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: CreditCard,
    title: 'Comptes Multi-SFD',
    description: 'Gérez tous vos comptes en un seul endroit',
  },
  {
    icon: Shield,
    title: 'Sécurité Renforcée',
    description: 'Cryptage et authentification biométrique',
  },
  {
    icon: Zap,
    title: 'Microcrédits Rapides',
    description: 'Prêts approuvés en quelques minutes',
  },
  {
    icon: PiggyBank,
    title: "Coffres d'Épargne",
    description: 'Épargnez seul ou en groupe',
  },
  {
    icon: Smartphone,
    title: 'Mobile Money',
    description: 'Orange Money, MTN, Moov',
  },
  {
    icon: BarChart3,
    title: 'Suivi Temps Réel',
    description: 'Tableaux de bord et notifications',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Une plateforme complète pour gérer vos finances au quotidien
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="group"
            >
              <div className="h-full bg-card rounded-2xl p-6 border border-border/50 shadow-soft-sm hover:shadow-soft-md transition-shadow duration-300">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

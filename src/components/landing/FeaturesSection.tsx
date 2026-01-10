import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Zap, Target, Smartphone, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: CreditCard,
    title: 'Comptes Multi-SFD',
    description: 'Gérez tous vos comptes en un seul endroit',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Lock,
    title: 'Sécurité Bancaire',
    description: 'Cryptage bout en bout et biométrie',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Microcrédits Instantanés',
    description: 'Prêts approuvés en quelques minutes',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Target,
    title: "Coffres d'Épargne",
    description: 'Épargnez seul ou en groupe',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Smartphone,
    title: 'Mobile Money',
    description: 'Orange Money, MTN, Moov',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Suivi en Temps Réel',
    description: 'Tableaux de bord et notifications',
    gradient: 'from-indigo-500 to-purple-500',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une plateforme complète pour gérer vos finances au quotidien
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="relative group cursor-pointer"
            >
              {/* Subtle glow */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-3xl`} />
              
              {/* Card */}
              <div className="relative h-full bg-white rounded-3xl p-8 border border-border/40 shadow-soft-sm hover:shadow-soft-md transition-all duration-400 ease-premium">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-soft-md group-hover:shadow-soft-lg transition-shadow duration-400`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
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

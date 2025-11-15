import React from 'react';
import { motion } from 'framer-motion';
import { Download, UserPlus, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Download,
    title: 'Télécharger',
    description: 'Gratuit sur iOS et Android',
    badge: '1',
  },
  {
    icon: UserPlus,
    title: "S'inscrire",
    description: 'KYC en 5 minutes',
    badge: '2',
  },
  {
    icon: Sparkles,
    title: 'Commencer',
    description: 'Premier prêt en 24h',
    badge: '3',
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Trois étapes simples pour commencer votre parcours financier
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#0D6A51] via-[#FFAB2E] to-[#0D6A51] -translate-y-1/2 opacity-20" />
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="relative"
              >
                {/* Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-[#0D6A51] to-[#176455] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                  {step.badge}
                </div>
                
                {/* Card */}
                <motion.div
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-3xl p-8 pt-12 text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50"
                >
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#0D6A51] to-[#176455] flex items-center justify-center shadow-lg">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

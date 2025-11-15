import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';

interface DownloadSectionProps {
  onDownloadClick: () => void;
}

const DownloadSection: React.FC<DownloadSectionProps> = ({ onDownloadClick }) => {
  return (
    <section className="py-24 bg-gradient-to-br from-[#0D6A51] via-[#176455] to-[#0D6A51] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#FFAB2E] rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl"
          >
            <Smartphone className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Prêt à transformer votre avenir financier ?
          </h2>

          {/* Subtitle */}
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Rejoignez les 50 000+ Maliens qui gèrent déjà leurs finances avec N'GNA SÔRÔ
          </p>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onDownloadClick}
              size="lg"
              className="h-16 px-12 rounded-2xl bg-white text-[#0D6A51] hover:bg-white/90 font-bold text-xl shadow-2xl"
            >
              <Download className="w-6 h-6 mr-3" />
              Télécharger N'GNA SÔRÔ
            </Button>
          </motion.div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-white/80">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="text-sm">100% Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇲🇱</span>
              <span className="text-sm">Projet MEREF Mali</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-sm">4.8/5 - 5K+ avis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-sm">Gratuit</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DownloadSection;

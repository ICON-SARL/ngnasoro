import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { spacing, borderRadius, backgrounds } from '@/lib/design-tokens';
import { fadeInUp } from '@/lib/animation-variants';

interface DownloadSectionProps {
  onDownloadClick: () => void;
}

const DownloadSection: React.FC<DownloadSectionProps> = ({ onDownloadClick }) => {
  return (
    <section id="download" className={`${spacing.sectionPy} relative overflow-hidden ${backgrounds.gradient}`}>
      {/* Animated background elements - reduced for subtlety */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-[#FFAB2E] rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className={`container mx-auto ${spacing.containerPx} relative z-10`}>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block mb-8"
          >
            <div className={`w-24 h-24 ${borderRadius.card} bg-white shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform`}>
              <Smartphone className="w-12 h-12 text-[#0D6A51]" />
            </div>
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
          <Button
            onClick={onDownloadClick}
            size="lg"
            className={`h-16 px-12 ${borderRadius.button} bg-white text-[#0D6A51] hover:bg-white/90 font-bold text-xl shadow-2xl hover:scale-105 transition-transform mb-8`}
          >
            <Download className="w-6 h-6 mr-3" />
            Télécharger N'GNA SÔRÔ
          </Button>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-white/80">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="text-sm">100% Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇲🇱</span>
              <span className="text-sm">Soutenu par le MEREF</span>
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

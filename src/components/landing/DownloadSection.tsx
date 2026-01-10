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
    <section id="download" className={`${spacing.sectionPy} relative overflow-hidden bg-gradient-to-b from-primary via-primary/90 to-background`}>
      {/* Animated background elements - minimal */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-full opacity-20"
            style={{
              left: `${15 + i * 25}%`,
              top: `${20 + i * 15}%`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
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
            <div className={`w-24 h-24 ${borderRadius.card} bg-white shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform border-4 border-white/30 relative`}>
              {/* Gradient glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#0D6A51]/20 to-[#FFAB2E]/20 blur-xl rounded-3xl opacity-50" />
              
              <Smartphone className="w-12 h-12 text-[#0D6A51] relative z-10" />
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Prêt à transformer votre avenir financier ?
          </h2>

          {/* Subtitle */}
          <p className="text-xl text-white mb-10 max-w-2xl mx-auto font-medium drop-shadow-md">
            Rejoignez les 50 000+ Maliens qui gèrent déjà leurs finances avec N'GNA SÔRÔ
          </p>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block mb-8"
          >
            <Button
              onClick={onDownloadClick}
              size="lg"
              className={`h-16 px-12 ${borderRadius.button} bg-white text-primary hover:bg-white/95 font-bold text-xl shadow-soft-xl border border-white/30 relative overflow-hidden group transition-all duration-400 ease-premium`}
            >
              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-premium" />
              
              <Download className="w-6 h-6 mr-3 relative z-10" />
              <span className="relative z-10">Télécharger N'GNA SÔRÔ</span>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mt-12 max-w-3xl mx-auto">
            {[
              { icon: '🔒', text: '100% Sécurisé' },
              { icon: '🇲🇱', text: 'Soutenu par le MEREF' },
              { icon: '⭐', text: '4.8/5 - 5K+ avis' },
              { icon: '💰', text: 'Gratuit' },
            ].map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -3 }}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white shadow-soft-md border border-white/40 hover:shadow-soft-lg transition-all duration-400 ease-premium group"
              >
                <span className="text-2xl group-hover:scale-105 transition-transform duration-300">
                  {badge.icon}
                </span>
                <span className="font-bold text-foreground text-sm whitespace-nowrap">
                  {badge.text}
                </span>
              </motion.div>
            ))}
          </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DownloadSection;

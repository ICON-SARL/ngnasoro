import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { spacing, borderRadius, backgrounds } from '@/lib/design-tokens';
import { fadeInUp, scaleIn } from '@/lib/animation-variants';

interface HeroSectionProps {
  onDownloadClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onDownloadClick }) => {
  const navigate = useNavigate();

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${backgrounds.gradient} pt-20`}>
      {/* Animated background particles - reduced for subtlety */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#FFAB2E] rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="text-center lg:text-left"
          >
            {/* Badge Mali */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="inline-block mb-6"
            >
              <Badge className="bg-white/20 backdrop-blur-lg text-white border-white/30 px-4 py-2 text-sm font-medium">
                🇲🇱 Ministère de l'Économie et des Finances - Mali
              </Badge>
            </motion.div>

            {/* Logo + Title */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mb-6"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
                N'GNA SÔRÔ
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-lg text-white/80 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Accédez à des services financiers inclusifs partout au Mali. 
              Du centre-ville au village, gérez votre argent simplement.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                onClick={onDownloadClick}
                size="lg"
                className={`h-14 px-8 ${borderRadius.button} bg-white text-[#0D6A51] hover:bg-white/90 font-semibold text-lg shadow-2xl hover:scale-105 transition-transform`}
              >
                <Download className="w-5 h-5 mr-2" />
                Télécharger l'app
              </Button>
              <Button
                onClick={() => navigate('/sfd-partners')}
                variant="outline"
                size="lg"
                className={`h-14 px-8 ${borderRadius.button} bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold text-lg`}
              >
                Découvrir les SFD
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-6 justify-center lg:justify-start mt-8 text-white/70 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span>Sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span>4.8/5 - 5K+ avis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <span>Agréé MEREF</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right mockup */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="relative hidden lg:flex justify-center items-center"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-[#FFAB2E]/20 blur-3xl rounded-full scale-150" />
              
              {/* Phone mockup placeholder */}
              <div className={`relative w-[280px] h-[580px] ${backgrounds.glass} rounded-[3rem] border-4 border-white/30 shadow-2xl overflow-hidden`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-black/50 rounded-b-3xl" />
                <div className="p-4 h-full flex flex-col">
                  <div className="flex-1 bg-gradient-to-b from-white/20 to-white/5 rounded-3xl" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
    </section>
  );
};

export default HeroSection;

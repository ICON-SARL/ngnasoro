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
      {/* Animated background particles - minimal */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-full opacity-20"
            style={{
              left: `${20 + i * 20}%`,
              top: `${15 + i * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
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
              className="flex flex-wrap gap-6 justify-center lg:justify-start mt-8 text-white text-sm font-medium"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
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
                y: [0, -12, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              {/* Soft glow effect */}
              <div className="absolute inset-0 bg-accent/15 blur-3xl rounded-full scale-125" />
              
              {/* Phone mockup with app preview */}
              <div className={`relative w-[280px] h-[580px] bg-white/10 backdrop-blur-lg rounded-[3rem] border border-white/20 shadow-soft-xl overflow-hidden`}>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-black/40 rounded-b-2xl z-10" />
                
                {/* Screen content mockup */}
                <div className="p-3 pt-10 h-full flex flex-col gap-3">
                  {/* Header mockup */}
                  <div className="bg-white/15 rounded-2xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/30 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-3 bg-white/40 rounded w-24 mb-1.5" />
                        <div className="h-2 bg-white/20 rounded w-16" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Balance card mockup */}
                  <div className="bg-gradient-to-br from-accent/80 to-accent/60 rounded-2xl p-4">
                    <div className="h-2 bg-white/30 rounded w-16 mb-3" />
                    <div className="h-6 bg-white/50 rounded w-32 mb-2" />
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 h-8 bg-white/30 rounded-xl" />
                      <div className="flex-1 h-8 bg-white/20 rounded-xl" />
                    </div>
                  </div>
                  
                  {/* Quick actions mockup */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white/10 rounded-xl p-3 h-16" />
                    <div className="flex-1 bg-white/10 rounded-xl p-3 h-16" />
                  </div>
                  
                  {/* Transactions mockup */}
                  <div className="flex-1 bg-white/10 rounded-2xl p-3 space-y-2">
                    <div className="h-2 bg-white/30 rounded w-20 mb-3" />
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2 py-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg" />
                        <div className="flex-1">
                          <div className="h-2.5 bg-white/30 rounded w-24 mb-1" />
                          <div className="h-2 bg-white/15 rounded w-16" />
                        </div>
                        <div className="h-3 bg-white/25 rounded w-12" />
                      </div>
                    ))}
                  </div>
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

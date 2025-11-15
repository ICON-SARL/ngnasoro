import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onDownloadClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onDownloadClick }) => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0D6A51] via-[#176455] to-[#0D6A51] pt-20">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#FFAB2E] rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center lg:text-left"
          >
            {/* Badge Mali */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6"
            >
              <Badge className="bg-white/20 backdrop-blur-lg text-white border-white/30 px-4 py-2 text-sm font-medium">
                🇲🇱 Un projet du MEREF - République du Mali
              </Badge>
            </motion.div>

            {/* Logo + Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                N'GNA SÔRÔ
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 font-light">
                La maison de l'argent
              </p>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/80 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              La plateforme du MEREF pour démocratiser les services financiers au Mali. 
              De la ville au village, l'argent à portée de main.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                onClick={onDownloadClick}
                size="lg"
                className="h-14 px-8 rounded-2xl bg-white text-[#0D6A51] hover:bg-white/90 font-semibold text-lg shadow-2xl hover:scale-105 transition-transform"
              >
                <Download className="w-5 h-5 mr-2" />
                Télécharger l'app
              </Button>
              <Button
                onClick={() => navigate('/sfd-partners')}
                variant="outline"
                size="lg"
                className="h-14 px-8 rounded-2xl bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold text-lg"
              >
                Découvrir les SFD
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
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
              <div className="absolute inset-0 bg-[#FFAB2E]/30 blur-3xl rounded-full scale-150" />
              
              {/* Phone mockup placeholder */}
              <div className="relative w-[280px] h-[580px] bg-white/10 backdrop-blur-xl rounded-[3rem] border-4 border-white/30 shadow-2xl overflow-hidden">
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

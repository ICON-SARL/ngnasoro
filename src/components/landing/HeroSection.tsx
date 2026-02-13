import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoNgnaSoro from '@/assets/logo-ngna-soro.jpg';

interface HeroSectionProps {
  onDownloadClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onDownloadClick }) => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0D6A51] via-[#0B5A44] to-[#094A3A] pt-20">
      {/* Subtle SVG pattern - matching auth page */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.06]">
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]" viewBox="0 0 800 800">
          <circle cx="400" cy="400" r="300" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="400" cy="400" r="200" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="100" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo in white circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center">
              <img
                src={logoNgnaSoro}
                alt="N'GNA SÔRÔ"
                className="w-14 h-14 rounded-full object-cover"
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4"
          >
            N'GNA SÔRÔ
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/80 mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Services financiers inclusifs partout au Mali.
            Gérez votre argent simplement.
          </motion.p>

          {/* Single CTA + text link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-4 mb-10"
          >
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="h-13 px-8 rounded-2xl bg-white text-[#0D6A51] hover:bg-white/90 font-semibold text-base shadow-lg transition-all"
            >
              Commencer maintenant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <button
              onClick={() => navigate('/sfd-partners')}
              className="text-white/60 hover:text-white/90 text-sm font-medium transition-colors"
            >
              Découvrir les SFD partenaires →
            </button>
          </motion.div>

          {/* Trust - simple text line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-white/50 text-sm"
          >
            Sécurisé · Agréé MEREF · 5K+ utilisateurs
          </motion.p>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;

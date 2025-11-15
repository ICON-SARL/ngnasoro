import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Download, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavigationHeaderProps {
  onDownloadClick: () => void;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ onDownloadClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Accueil', action: () => scrollToSection('hero') },
    { label: 'Fonctionnalités', action: () => scrollToSection('features') },
    { label: 'SFD Partenaires', action: () => navigate('/sfd-partners') },
    { label: 'Support', action: () => navigate('/faq') },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-2xl border-b border-gray-200 shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D6A51] to-[#176455] flex items-center justify-center shadow-lg">
                <span className="text-xl">💰</span>
              </div>
              <span
                className={`text-xl font-bold transition-colors ${
                  scrolled ? 'text-gray-900' : 'text-white'
                }`}
              >
                N'GNA SÔRÔ
              </span>
            </motion.button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={`font-medium transition-colors hover:text-[#0D6A51] ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* CTA + Mobile Menu */}
            <div className="flex items-center gap-4">
              <Button
                onClick={onDownloadClick}
                className={`h-11 px-6 rounded-xl font-semibold transition-all ${
                  scrolled
                    ? 'bg-[#0D6A51] hover:bg-[#176455] text-white'
                    : 'bg-white text-[#0D6A51] hover:bg-white/90'
                }`}
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Télécharger</span>
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  scrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ top: '80px' }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              className="relative bg-white rounded-b-3xl shadow-2xl p-6"
            >
              <div className="space-y-4">
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={link.action}
                    className="block w-full text-left px-4 py-3 rounded-xl font-medium text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavigationHeader;

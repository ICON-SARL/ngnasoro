import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoNgnaSoro from '@/assets/logo-ngna-soro.jpg';

interface NavigationHeaderProps {
  onDownloadClick?: () => void;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = () => {
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

  const navLinks = [
    { label: 'Accueil', href: '#hero' },
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'SFD Partenaires', action: () => navigate('/sfd-partners') },
    { label: 'FAQ', action: () => navigate('/faq') },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    if (link.action) {
      link.action();
    } else if (link.href) {
      const element = document.querySelector(link.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <img 
                  src={logoNgnaSoro} 
                  alt="N'GNA SÔRÔ" 
                  className="w-6 h-6 rounded-full object-cover"
                />
              </div>
              <span className={`text-lg font-bold transition-colors ${
                scrolled ? 'text-foreground' : 'text-white'
              }`}>
                N'GNA SÔRÔ
              </span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    scrolled ? 'text-muted-foreground' : 'text-white/80'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/auth')}
                size="sm"
                className={`rounded-xl font-medium ${
                  scrolled
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'bg-white/15 border border-white/20 text-white hover:bg-white/25'
                }`}
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Connexion
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  scrolled ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/10'
                }`}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm h-screen"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative bg-background rounded-b-2xl shadow-lg p-4 mx-4 border border-border/50">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link)}
                    className="block w-full text-left px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavigationHeader;

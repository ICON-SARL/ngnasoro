
import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-4 px-6 border-t border-gray-100 mt-auto bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <a href="/" className="hover:text-[#0D6A51] transition-colors text-center md:text-left">
            Accueil
          </a>
          <a href="/about" className="hover:text-[#0D6A51] transition-colors text-center md:text-left">
            À propos
          </a>
          <a href="/contact" className="hover:text-[#0D6A51] transition-colors text-center md:text-left">
            Contact
          </a>
          <a href="/legal" className="hover:text-[#0D6A51] transition-colors text-center md:text-left">
            Mentions légales
          </a>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-1">
          Fait avec <Heart className="h-3 w-3 text-red-400" /> pour les SFDs du pays
        </div>
        <div className="mt-4 md:mt-0 text-center md:text-right">
          © {new Date().getFullYear()} MEREF-SFD. Tous droits réservés
        </div>
      </div>
    </footer>
  );
};

export default Footer;

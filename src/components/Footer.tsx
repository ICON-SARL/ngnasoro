
import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-4 px-6 border-t border-gray-100 mt-auto bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
        <div>
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} MEREF-SFD. Tous droits réservés
          </p>
        </div>
        <div className="mt-2 md:mt-0 flex items-center gap-1">
          Fait avec <Heart className="h-3 w-3 text-red-400" /> pour les SFDs du pays
        </div>
      </div>
    </footer>
  );
};

export default Footer;


import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, Heart, Facebook, Twitter, Instagram, Shield, Check, HelpCircle } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-[#0D6A51] flex items-center justify-center text-white font-medium">
                S
              </div>
              <span className="font-bold text-xl">SecureFlux</span>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Plateforme sécurisée de gestion des services financiers et de prêts avec les SFD partenaires.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-8">
            <div>
              <h3 className="font-semibold text-white mb-3 flex items-center">
                <Check className="h-4 w-4 mr-2 text-[#0D6A51]" />
                Services
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/loans" className="hover:text-[#0D6A51] transition-colors">
                    Prêts et financements
                  </Link>
                </li>
                <li>
                  <Link to="/mes-fonds" className="hover:text-[#0D6A51] transition-colors">
                    Gestion de fonds
                  </Link>
                </li>
                <li>
                  <Link to="/multi-sfd" className="hover:text-[#0D6A51] transition-colors">
                    Gestion Multi-SFD
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3 flex items-center">
                <HelpCircle className="h-4 w-4 mr-2 text-[#0D6A51]" />
                Support
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/faq" className="hover:text-[#0D6A51] transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#0D6A51] transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/securite" className="hover:text-[#0D6A51] transition-colors">
                    Sécurité
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-[#0D6A51]" />
                Légal
              </h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/terms" className="hover:text-[#0D6A51] transition-colors">
                    Conditions générales
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#0D6A51] transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-800">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <a href="#" className="text-gray-500 hover:text-[#0D6A51] transition-colors">
              <Facebook size={18} />
            </a>
            <a href="#" className="text-gray-500 hover:text-[#0D6A51] transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" className="text-gray-500 hover:text-[#0D6A51] transition-colors">
              <Instagram size={18} />
            </a>
            <a href="#" className="text-gray-500 hover:text-[#0D6A51] transition-colors">
              <Github size={18} />
            </a>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <span>© {currentYear} MEREF-SFD. Tous droits réservés.</span>
            <span className="flex items-center ml-2">
              <Heart size={12} className="text-red-500 mx-1" />
              <span>pour un accès financier inclusif</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

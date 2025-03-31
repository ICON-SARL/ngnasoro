
import React from 'react';
import { Github, Mail, Heart, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-[#0D6A51] flex items-center justify-center text-white font-medium">
                S
              </div>
              <span className="font-medium text-lg text-gray-800">SecureFlux</span>
            </div>
            <p className="text-sm text-gray-600">
              La plateforme sécurisée pour gérer vos services financiers et vos prêts avec les SFD partenaires.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-[#0D6A51] transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0D6A51] transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0D6A51] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#0D6A51] transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/paiements" className="text-gray-600 hover:text-[#0D6A51] transition-colors">
                  Paiements sécurisés
                </a>
              </li>
              <li>
                <a href="/loans" className="text-gray-600 hover:text-[#0D6A51] transition-colors">
                  Prêts et financements
                </a>
              </li>
              <li>
                <a href="/mes-fonds" className="text-gray-600 hover:text-[#0D6A51] transition-colors">
                  Gestion de fonds
                </a>
              </li>
              <li>
                <a href="/multi-sfd" className="text-gray-600 hover:text-[#0D6A51] transition-colors">
                  Gestion Multi-SFD
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/faq" className="text-gray-600 hover:text-[#0D6A51] transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-600 hover:text-[#0D6A51] transition-colors">
                  Contacter un conseiller
                </a>
              </li>
              <li>
                <a href="/support" className="text-gray-600 hover:text-[#0D6A51] transition-colors">
                  Support technique
                </a>
              </li>
              <li>
                <a href="/securite" className="text-gray-600 hover:text-[#0D6A51] transition-colors">
                  Sécurité
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/terms" className="text-gray-600 hover:text-[#0D6A51] transition-colors">
                  Conditions générales
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-[#0D6A51] transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="/licenses" className="text-gray-600 hover:text-[#0D6A51] transition-colors">
                  Licences
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-gray-600 hover:text-[#0D6A51] transition-colors">
                  Politique des cookies
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-gray-500">
              © {currentYear} MEREF-SFD. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500 mt-4 md:mt-0">
              <span>Développé avec</span>
              <Heart size={14} className="text-red-500 mx-1" />
              <span>pour un accès financier inclusif</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

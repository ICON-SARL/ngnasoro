import React from 'react';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const FooterSection: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-8 h-8 text-[#FFAB2E]" />
              <span className="text-2xl font-bold">N'GNA SÔRÔ</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Un projet du MEREF pour démocratiser les services financiers au Mali. 
              De la ville au village, l'argent à portée de main.
            </p>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-2xl">🇲🇱</span>
              <span className="text-sm">République du Mali</span>
            </div>
          </div>

          {/* Produit */}
          <div>
            <h3 className="font-bold text-lg mb-4">Produit</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link to="/sfd-partners" className="hover:text-white transition-colors">
                  SFD Partenaires
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#download" className="hover:text-white transition-colors">
                  Télécharger
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Centre d'Aide
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  Tutoriels
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid sm:grid-cols-3 gap-6 text-gray-400 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#FFAB2E]" />
              <span>contact@ngnasoro.ml</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#FFAB2E]" />
              <span>+223 20 XX XX XX</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#FFAB2E]" />
              <span>Bamako, Mali</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© 2025 MEREF. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link to="/legal/cgu" className="hover:text-white transition-colors">
              CGU
            </Link>
            <Link to="/legal/privacy" className="hover:text-white transition-colors">
              Confidentialité
            </Link>
            <Link to="/legal/mentions" className="hover:text-white transition-colors">
              Mentions Légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;

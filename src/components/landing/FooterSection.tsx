import React from 'react';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoNgnaSoro from '@/assets/logo-ngna-soro.jpg';

const FooterSection: React.FC = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logoNgnaSoro} 
                alt="N'GNA SÔRÔ" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-xl font-bold">N'GNA SÔRÔ</span>
            </div>
            <p className="text-background/70 text-sm mb-4">
              Démocratiser les services financiers au Mali.
            </p>
            <div className="flex items-center gap-2 text-background/60 text-sm">
              <span>🇲🇱</span>
              <span>République du Mali</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-background/70 text-sm">
              <li>
                <Link to="/sfd-partners" className="hover:text-background transition-colors">
                  SFD Partenaires
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-background transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-background transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-background/70 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                <span>contact@ngnasoro.ml</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                <span>+223 20 XX XX XX</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Bamako, Mali</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-background/60">
          <p>© 2025 MEREF. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link to="/legal/cgu" className="hover:text-background transition-colors">
              CGU
            </Link>
            <Link to="/legal/privacy" className="hover:text-background transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;

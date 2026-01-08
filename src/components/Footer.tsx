import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Shield, FileText, Scale } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    legal: [
      { label: 'Conditions d\'utilisation', href: '/legal/cgu', icon: FileText },
      { label: 'Politique de confidentialité', href: '/legal/privacy', icon: Shield },
      { label: 'Mentions légales', href: '/legal/mentions', icon: Scale },
    ],
    navigation: [
      { label: 'Accueil', href: '/' },
      { label: 'Nos partenaires SFD', href: '/sfd-partners' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
    ],
  };

  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                N'GNA SÔRÔ
              </span>
            </motion.div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Votre plateforme de microfinance digitale, sécurisée et accessible.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>contact@ngnasoro.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>+223 70 00 00 00</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Bamako, Mali</span>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Navigation</h4>
            <ul className="space-y-2">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Informations légales</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>© {currentYear} N'GNA SÔRÔ. Tous droits réservés.</p>
            <p className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Plateforme sécurisée et conforme BCEAO
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

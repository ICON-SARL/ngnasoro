import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Phone, Mail, HelpCircle, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const SupportPage: React.FC = () => {
  const navigate = useNavigate();

  const openWhatsApp = () => {
    const phoneNumber = '2250700000000';
    const message = encodeURIComponent('Bonjour, j\'ai besoin d\'aide concernant mon compte NGN\'ASORO.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const callSupport = () => {
    window.location.href = 'tel:+2250700000000';
  };

  const quickContactOptions = [
    {
      icon: MessageCircle,
      title: 'Discutez sur WhatsApp',
      description: 'Réponse rapide 7j/7',
      color: 'bg-[#25D366]',
      action: openWhatsApp
    },
    {
      icon: Phone,
      title: 'Appelez-nous',
      description: '+225 07 00 00 00 00',
      color: 'bg-blue-500',
      action: callSupport
    }
  ];

  const otherContactOptions = [
    {
      icon: Mail,
      title: 'Email',
      description: 'support@ngnasoro.com',
      color: 'bg-purple-500',
      action: () => window.location.href = 'mailto:support@ngnasoro.com'
    },
    {
      icon: User,
      title: 'Mon conseiller',
      description: 'Contacter mon agent SFD',
      color: 'bg-indigo-500',
      action: () => {}
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Centre d'aide</h1>
        <p className="text-sm opacity-90">
          Nous sommes là pour vous aider
        </p>
      </div>

      {/* Contact rapide */}
      <div className="px-4 -mt-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 px-2">Contact Rapide</h2>
          <div className="grid grid-cols-1 gap-3">
            {quickContactOptions.map((option, index) => (
              <motion.button
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={option.action}
                className="bg-card rounded-3xl p-5 text-left shadow-sm border border-border hover:shadow-md transition-all active:scale-98"
              >
                <div className="flex items-center gap-4">
                  <div className={`${option.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0`}>
                    <option.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Autres moyens de contact */}
        <div>
          <h2 className="text-lg font-semibold mb-4 px-2">Autres Moyens de Contact</h2>
          <div className="grid grid-cols-2 gap-3">
            {otherContactOptions.map((option, index) => (
              <motion.button
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={option.action}
                className="bg-card rounded-2xl p-4 text-left shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <div className={`${option.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3`}>
                  <option.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{option.title}</h3>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Aide rapide */}
        <div className="bg-card rounded-3xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Aide Rapide</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start rounded-xl h-auto py-3">
              <div className="text-left">
                <p className="font-medium text-sm">Comment faire un dépôt ?</p>
                <p className="text-xs text-muted-foreground">Guide étape par étape</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl h-auto py-3">
              <div className="text-left">
                <p className="font-medium text-sm">Demander un prêt</p>
                <p className="text-xs text-muted-foreground">Conditions et procédure</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl h-auto py-3">
              <div className="text-left">
                <p className="font-medium text-sm">Rejoindre une tontine</p>
                <p className="text-xs text-muted-foreground">Épargner ensemble</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start rounded-xl h-auto py-3">
              <div className="text-left">
                <p className="font-medium text-sm">Sécurité du compte</p>
                <p className="text-xs text-muted-foreground">Protégez vos données</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;

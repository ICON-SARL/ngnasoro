import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Phone, Mail, MessageSquare, BookOpen, FileText, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleContactAction = (action: () => void, message: string) => {
    toast({
      title: "Action en cours...",
      description: message,
      duration: 2000,
    });
    setTimeout(() => action(), 300);
  };

  const openWhatsApp = () => {
    const phoneNumber = '2250700000000';
    const message = encodeURIComponent('Bonjour, j\'ai besoin d\'aide concernant mon compte NGN\'ASORO.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const callSupport = () => {
    window.location.href = 'tel:+2250700000000';
  };

  const contactOptions = [
    {
      icon: MessageCircle,
      title: 'Discutez sur WhatsApp',
      description: 'Réponse rapide 7j/7',
      color: 'bg-[#25D366]',
      action: openWhatsApp,
      actionMessage: "Ouverture de WhatsApp..."
    },
    {
      icon: Phone,
      title: 'Appelez-nous',
      description: '+225 07 00 00 00 00',
      color: 'bg-[#176455]',
      action: callSupport,
      actionMessage: "Lancement de l'appel..."
    },
    {
      icon: Mail,
      title: 'Envoyez un Email',
      description: 'support@ngnasoro.com',
      color: 'bg-[#fcb041]',
      action: () => window.location.href = 'mailto:support@ngnasoro.com',
      actionMessage: "Ouverture du client mail..."
    },
    {
      icon: MessageSquare,
      title: 'Messagerie interne',
      description: 'Chat avec le support',
      color: 'bg-[#1a7a65]',
      action: () => navigate('/mobile-flow/chat-support'),
      actionMessage: "Ouverture du chat..."
    }
  ];

  const resourceOptions = [
    {
      icon: BookOpen,
      title: 'Questions fréquentes',
      description: '12 articles disponibles',
      path: '/mobile-flow/faq'
    },
    {
      icon: FileText,
      title: 'Guide d\'utilisation',
      description: 'Documentation complète',
      path: '/mobile-flow/guide'
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
        <h1 className="text-2xl font-bold mb-2">Centre d'Aide</h1>
        <p className="text-sm opacity-90">
          Nous sommes là pour vous accompagner
        </p>
      </div>

      <div className="px-4 pt-6 space-y-6 pb-6">
        {/* Statut de disponibilité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Support disponible</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              Lun-Ven : 8h-18h | Sam : 9h-13h
            </p>
          </div>
        </motion.div>

        {/* Nous Contacter */}
        <div>
          <h2 className="text-base font-semibold mb-4 text-foreground">Nous Contacter</h2>
          <div className="grid grid-cols-1 gap-3">
            {contactOptions.map((option, index) => (
              <motion.button
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleContactAction(option.action, option.actionMessage)}
                className="bg-card rounded-3xl p-5 text-left shadow-sm border border-border hover:shadow-lg active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`${option.color} w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <option.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-0.5 truncate">{option.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{option.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Ressources */}
        <div>
          <h2 className="text-base font-semibold mb-4 text-foreground">Ressources Utiles</h2>
          <div className="grid grid-cols-1 gap-3">
            {resourceOptions.map((option, index) => (
              <motion.button
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => navigate(option.path)}
                className="bg-card rounded-3xl p-5 text-left shadow-sm border border-border hover:shadow-lg active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-accent/20 w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <option.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-0.5 truncate">{option.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{option.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-3xl p-5"
        >
          <h3 className="font-semibold text-base mb-2">Besoin d'aide urgente ?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Notre équipe WhatsApp est disponible 7j/7 pour répondre à vos questions en temps réel.
          </p>
          <button
            onClick={() => handleContactAction(openWhatsApp, "Ouverture de WhatsApp...")}
            className="w-full bg-[#25D366] text-white rounded-2xl py-3 font-medium hover:bg-[#128C7E] transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Chatter sur WhatsApp
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SupportPage;

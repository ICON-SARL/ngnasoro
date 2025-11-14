import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Phone, Mail, HelpCircle, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const SupportPage: React.FC = () => {
  const navigate = useNavigate();

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Chat en direct',
      description: 'Discutez avec notre équipe',
      color: 'bg-blue-500',
      action: () => {}
    },
    {
      icon: Phone,
      title: 'Appelez-nous',
      description: '+225 XX XX XX XX XX',
      color: 'bg-green-500',
      action: () => {}
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'support@ngnasoro.com',
      color: 'bg-purple-500',
      action: () => {}
    },
    {
      icon: HelpCircle,
      title: 'FAQ',
      description: 'Questions fréquentes',
      color: 'bg-orange-500',
      action: () => {}
    },
    {
      icon: FileText,
      title: 'Guides',
      description: 'Documentation',
      color: 'bg-pink-500',
      action: () => {}
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

      {/* Support options */}
      <div className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {supportOptions.map((option, index) => (
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

        {/* Quick help */}
        <div className="bg-card rounded-3xl p-6 border border-border">
          <h2 className="font-semibold mb-4">Aide rapide</h2>
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

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageCircle, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';

const faqCategories = [
  {
    category: 'Compte',
    icon: '👤',
    questions: [
      {
        q: 'Comment créer un compte N\'GNA SÔRÔ ?',
        a: 'Téléchargez l\'application, choisissez une SFD partenaire, remplissez le formulaire d\'adhésion avec vos informations personnelles, et attendez la validation de votre SFD (généralement sous 24-48h).',
      },
      {
        q: 'Quels documents sont nécessaires pour l\'inscription ?',
        a: 'Vous aurez besoin d\'une pièce d\'identité valide (CNI, passeport), d\'un justificatif de domicile, et d\'un numéro de téléphone actif. Des documents supplémentaires peuvent être demandés selon le niveau KYC souhaité.',
      },
      {
        q: 'Comment augmenter mon niveau KYC ?',
        a: 'Accédez à votre profil, sélectionnez "Augmenter KYC", téléversez les documents requis (justificatif de revenus, documents complémentaires), et attendez la validation de votre SFD.',
      },
    ],
  },
  {
    category: 'Prêts',
    icon: '💰',
    questions: [
      {
        q: 'Quel montant puis-je emprunter ?',
        a: 'Le montant dépend de votre niveau KYC : Niveau 1 (jusqu\'à 50 000 FCFA), Niveau 2 (jusqu\'à 500 000 FCFA), Niveau 3 (sans limite selon votre capacité de remboursement). Chaque SFD a également ses propres plans de prêt.',
      },
      {
        q: 'Combien de temps pour obtenir un prêt ?',
        a: 'Une fois votre demande approuvée par votre SFD, le décaissement est généralement effectué sous 24h. Le délai d\'approbation dépend de la complexité de votre dossier (1 à 5 jours ouvrés).',
      },
      {
        q: 'Comment rembourser mon prêt ?',
        a: 'Vous pouvez rembourser via Mobile Money (Orange Money, MTN, Moov), en espèces auprès de votre agence SFD, ou par virement bancaire. Les remboursements sont automatiquement déduits selon l\'échéancier.',
      },
    ],
  },
  {
    category: 'Coffres',
    icon: '🔐',
    questions: [
      {
        q: 'Qu\'est-ce qu\'un coffre collaboratif ?',
        a: 'Un coffre collaboratif est un compte d\'épargne partagé entre plusieurs membres. Chaque membre contribue selon des règles définies, et les retraits sont soumis au vote des membres selon la règle choisie (majorité, unanimité, etc.).',
      },
      {
        q: 'Comment créer un coffre collaboratif ?',
        a: 'Allez dans "Coffres" > "Créer un coffre", définissez l\'objectif, le montant cible, les règles de retrait, puis invitez vos membres par email ou numéro de téléphone.',
      },
      {
        q: 'Puis-je retirer avant d\'atteindre l\'objectif ?',
        a: 'Cela dépend des paramètres définis à la création du coffre. Si "Retrait avant objectif" est activé, vous pouvez faire une demande qui sera soumise au vote des autres membres.',
      },
    ],
  },
  {
    category: 'Sécurité',
    icon: '🔒',
    questions: [
      {
        q: 'Mes données sont-elles sécurisées ?',
        a: 'Oui, nous utilisons un chiffrement de niveau bancaire (SSL/TLS), une authentification à deux facteurs (2FA), et toutes les données sensibles sont stockées de manière sécurisée. N\'GNA SÔRÔ est agréé par le MEREF.',
      },
      {
        q: 'Comment activer l\'authentification à deux facteurs ?',
        a: 'Allez dans Profil > Sécurité > Authentification 2FA, scannez le QR code avec une app d\'authentification (Google Authenticator, Authy), puis confirmez avec le code généré.',
      },
      {
        q: 'Que faire si j\'ai perdu mon téléphone ?',
        a: 'Contactez immédiatement votre SFD ou le support N\'GNA SÔRÔ au +223 20 XX XX XX pour bloquer temporairement votre compte. Vous pourrez le réactiver après vérification de votre identité.',
      },
    ],
  },
];

const FAQLandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0D6A51] to-[#176455] text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
              <HelpCircle className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Foire Aux Questions
            </h1>
            <p className="text-lg text-white/90 mb-8">
              Trouvez rapidement des réponses à vos questions sur N'GNA SÔRÔ
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-white text-gray-900 border-0 shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {filteredCategories.length > 0 ? (
            <div className="space-y-8">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D6A51] to-[#176455] flex items-center justify-center text-2xl shadow-lg">
                      {category.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {category.category}
                    </h2>
                    <Badge className="ml-2">
                      {category.questions.length}
                    </Badge>
                  </div>

                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((item, qIndex) => (
                      <AccordionItem
                        key={qIndex}
                        value={`${category.category}-${qIndex}`}
                        className="border border-gray-200 rounded-2xl px-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-[#0D6A51] py-5">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 pb-5 leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Aucune question trouvée</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-br from-[#0D6A51] to-[#176455] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Notre équipe support est là pour vous aider
          </p>
          <Button
            onClick={() => navigate('/contact')}
            size="lg"
            className="h-14 px-8 rounded-2xl bg-white text-[#0D6A51] hover:bg-white/90 font-semibold"
          >
            Nous contacter
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FAQLandingPage;

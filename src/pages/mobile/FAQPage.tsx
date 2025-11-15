import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQPage: React.FC = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "Comment faire une demande d'adhésion ?",
      answer: "Pour adhérer à un SFD, allez dans 'Mon Profil' puis sélectionnez 'Adhérer à un SFD'. Remplissez le formulaire avec vos informations personnelles et attendez la validation par l'administrateur du SFD. Vous recevrez une notification dès que votre demande sera traitée."
    },
    {
      question: "Comment demander un prêt ?",
      answer: "Une fois votre adhésion validée, accédez à la section 'Prêts' depuis le menu principal. Consultez les plans de prêt disponibles, choisissez celui qui correspond à vos besoins, puis remplissez le formulaire de demande en indiquant le montant souhaité et l'objet du prêt."
    },
    {
      question: "Quels sont les moyens de remboursement disponibles ?",
      answer: "Vous pouvez rembourser vos prêts de plusieurs façons : en agence (espèces ou chèque), via Mobile Money (Orange Money, MTN, Moov), ou par virement bancaire. Les remboursements sont automatiquement comptabilisés dans votre compte."
    },
    {
      question: "Comment recharger mon compte d'épargne ?",
      answer: "Rendez-vous sur la page 'Mes Comptes', sélectionnez votre compte d'épargne et cliquez sur 'Recharger'. Vous pouvez effectuer un dépôt en agence ou utiliser Mobile Money pour alimenter votre compte instantanément."
    },
    {
      question: "Comment changer mon SFD actif ?",
      answer: "Si vous êtes membre de plusieurs SFDs, allez dans 'Mes Comptes' et vous verrez la liste de tous vos SFDs. Cliquez sur celui que vous souhaitez activer. Le badge 'Actif' indiquera votre SFD principal."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Nous utilisons les dernières technologies de sécurité pour protéger vos informations personnelles et financières. Vos transactions sont également sécurisées avec des protocoles bancaires standards."
    },
    {
      question: "Comment contacter le support en cas de problème ?",
      answer: "Vous pouvez nous contacter de plusieurs façons : via WhatsApp (réponse rapide 7j/7), par téléphone au +225 07 00 00 00 00, par email à support@ngnasoro.com, ou via la messagerie interne de l'application."
    },
    {
      question: "Que faire si j'ai oublié mon mot de passe ?",
      answer: "Sur la page de connexion, cliquez sur 'Mot de passe oublié'. Entrez votre adresse email, et vous recevrez un lien pour réinitialiser votre mot de passe. Pour des raisons de sécurité, ce lien expire après 1 heure."
    },
    {
      question: "Comment upgrader mon niveau KYC ?",
      answer: "Pour augmenter votre niveau KYC et accéder à des montants de prêt plus élevés, allez dans 'Mon Profil' puis 'Niveau KYC'. Téléchargez les documents requis (pièce d'identité, justificatif de domicile, justificatif de revenus) et attendez la vérification par votre SFD."
    },
    {
      question: "Combien de temps prend le traitement d'une demande de prêt ?",
      answer: "Le traitement d'une demande de prêt prend généralement entre 24 et 48 heures ouvrables. Vous recevrez une notification dès que votre demande sera approuvée ou si des informations supplémentaires sont nécessaires."
    },
    {
      question: "Comment puis-je consulter l'historique de mes transactions ?",
      answer: "Accédez à 'Mes Comptes', puis sélectionnez le compte dont vous souhaitez voir l'historique. Toutes vos transactions (dépôts, retraits, remboursements) sont listées avec la date, le montant et le statut."
    },
    {
      question: "Que signifient les différents statuts de prêt ?",
      answer: "Les statuts de prêt sont : 'En attente' (en cours d'analyse), 'Approuvé' (accepté mais pas encore décaissé), 'Actif' (en cours de remboursement), 'Complété' (entièrement remboursé), 'Rejeté' (refusé par le SFD)."
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
        <h1 className="text-2xl font-bold mb-2">Questions Fréquentes</h1>
        <p className="text-sm opacity-90">
          {faqs.length} articles • Trouvez rapidement des réponses
        </p>
      </div>

      {/* FAQ Content */}
      <div className="px-4 pt-6 pb-6">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <AccordionItem 
                value={`item-${index}`}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
                  <span className="text-left font-semibold text-base pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4 pt-2 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        {/* Contact Support Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-8 bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-3xl p-6"
        >
          <h3 className="font-semibold text-lg mb-2">Vous ne trouvez pas de réponse ?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Notre équipe de support est disponible pour vous aider
          </p>
          <button
            onClick={() => navigate('/mobile-flow/support')}
            className="w-full bg-primary text-primary-foreground rounded-2xl py-3 font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]"
          >
            Contacter le Support
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage;

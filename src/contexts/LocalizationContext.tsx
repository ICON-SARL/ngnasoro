
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'french' | 'bambara';

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  voiceOverEnabled: boolean;
  toggleVoiceOver: () => void;
}

// Traductions en français et bambara
const translations: Record<Language, Record<string, string>> = {
  french: {
    welcome: "Bienvenue dans l'assistant de demande de prêt. Appuyez sur commencer pour débuter votre demande.",
    idVerification: "Vérification d'identité: Téléchargez votre pièce d'identité nationale ou passeport.",
    selfie: "Prenez une photo de vous-même pour la vérification d'identité.",
    processing: "Nous vérifions vos documents. Veuillez patienter...",
    completed: "Vérification terminée. Merci!",
    loanApplication: "Demande de prêt",
    loanAmount: "Montant du prêt",
    loanDuration: "Durée du prêt",
    loanPurpose: "Objectif du prêt",
    submit: "Soumettre",
    cancel: "Annuler",
    next: "Suivant",
    previous: "Précédent",
    selectSfd: "Sélectionnez votre SFD",
    repayment: "Remboursement",
    withdrawal: "Retrait",
    payment: "Paiement",
    accountBalance: "Solde du compte",
    transactions: "Transactions",
    // Nouvelles traductions
    approvedLoan: "Prêt approuvé",
    processingRequest: "Traitement de votre demande en cours...",
    loanApproved: "Prêt approuvé!",
    fundsTransfer: "Les fonds seront déposés sur votre compte dans les 24 heures",
    nextSteps: "Prochaines étapes",
    congratulations: "Félicitations",
    confirmationCode: "Code de confirmation",
    enterCode: "Entrez le code de confirmation",
    resend: "Renvoyer",
    confirm: "Confirmer",
    downloadContract: "Télécharger le contrat",
    shareByEmail: "Partager par email",
    returnToHome: "Retourner à l'accueil",
    instantAccess: "Accès instantané",
    fundsAvailable: "Fonds disponibles dans les 24h",
    monthlyPayment: "Mensualité",
    firstPayment: "Première échéance",
    paymentSchedule: "Calendrier de paiement",
    insuranceProtection: "Protection Assurance",
    loanCovered: "Votre prêt est couvert par une assurance incluse",
    readTerms: "Veuillez lire les conditions générales du prêt avant de confirmer",
    confirmationSent: "Un code de confirmation valable pour",
    hasBeenSent: "a été envoyé à votre numéro de téléphone",
    codeExpiring: "Code expirant bientôt!",
    lessThanFiveMinutes: "Moins de 5 minutes restantes",
  },
  bambara: {
    welcome: "Aw bisimila crédit ɲini dɛmɛ baga la. Aw ka daminɛ bouton digi walasa ka aw ka ɲini daminɛ.",
    idVerification: "Kounben dɔn: I ka taamasiyen yira. I ka i ɲɛnafan wala i koyra kunnafonisɛbɛn yira.",
    selfie: "I ka i ɲɛfoto ta walasa an ka a dɔn ko i yɛrɛ don.",
    processing: "A bɛ i ka fɛnw sɛgɛsɛgɛ. I sabali dɛ...",
    completed: "I ka dantɛmɛsɛbɛn sɛgɛsɛgɛli banna. I ni ce!",
    loanApplication: "Juru ɲini",
    loanAmount: "Juru hakɛ",
    loanDuration: "Juru waati",
    loanPurpose: "Juru kun",
    submit: "A ci",
    cancel: "A boli",
    next: "Taa ɲɛ",
    previous: "Kɔsegi",
    selectSfd: "SFD sugandi",
    repayment: "Juru sara",
    withdrawal: "Wari bɔli",
    payment: "Wari sara",
    accountBalance: "Konto sɔrɔ",
    transactions: "Wari sɔrɔ ni bɔ",
    // Nouvelles traductions
    approvedLoan: "I ka juru daani",
    processingRequest: "I ka ɲini bɛka kɛ sisan...",
    loanApproved: "I ka juru daani bonya ye!",
    fundsTransfer: "Wari bɛna don i ka konto kɔnɔ o ye lɛrɛ 24 kɔnɔ",
    nextSteps: "Kow minw bɛ na",
    congratulations: "I ni ce",
    confirmationCode: "Daani tɛmɛsira",
    enterCode: "Daani tɛmɛsira sɛbɛn",
    resend: "A ci kokura",
    confirm: "A daani",
    downloadContract: "Daaniya sɛbɛn ta",
    shareByEmail: "A ci e-mail fɛ",
    returnToHome: "Segin so",
    instantAccess: "Joona don",
    fundsAvailable: "Wari bɛ se ka kɛ i bolo lɛrɛ 24 kɔnɔ",
    monthlyPayment: "Kalo sara",
    firstPayment: "Sara fɔlɔ",
    paymentSchedule: "Sara waatiw",
    insuranceProtection: "Lakanali",
    loanCovered: "I ka juru lakanalen don",
    readTerms: "I ka sartew kalan ka ban sani ka daani",
    confirmationSent: "Daani tɛmɛsira min bɛ se ka baara kɛ",
    hasBeenSent: "cilen don i ka telefɔn nɔmɔrɔ la",
    codeExpiring: "Tɛmɛsira bɛna ban joona!",
    lessThanFiveMinutes: "Miniti 5 belen bɛ",
  }
};

export const LocalizationContext = createContext<LocalizationContextType>({
  language: 'french',
  setLanguage: () => {},
  t: () => '',
  voiceOverEnabled: true,
  toggleVoiceOver: () => {},
});

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('french');
  const [voiceOverEnabled, setVoiceOverEnabled] = useState(true);

  // Fonction de traduction
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Fonction pour activer/désactiver la voix
  const toggleVoiceOver = () => {
    setVoiceOverEnabled(!voiceOverEnabled);
  };

  return (
    <LocalizationContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      voiceOverEnabled, 
      toggleVoiceOver 
    }}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Hook personnalisé pour un accès facile au contexte
export const useLocalization = () => useContext(LocalizationContext);

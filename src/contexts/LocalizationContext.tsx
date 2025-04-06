
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'french' | 'bambara';

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  voiceOverEnabled: boolean;
  toggleVoiceOver: () => void;
}

// French and Bambara translations
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

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Toggle voice over function
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

// Custom hook for easy context access
export const useLocalization = () => useContext(LocalizationContext);

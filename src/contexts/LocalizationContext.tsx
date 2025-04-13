
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import VoiceAssistantService from '@/utils/VoiceAssistantService';

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
    invalidCredentials: "Identifiants invalides. Veuillez vérifier vos informations.",
    // Add more translations as needed
  },
  bambara: {
    welcome: "I danbe ni cɛ juru sariya la. A mogoniw digi ka daminɛ.",
    idVerification: "Kounben dɔn: I ka taamasiyen yira. I ka i ɲɛnafan wala i koyra kunnafonisɛbɛn yira.",
    selfie: "I ka i ɲɛfoto ta walasa an ka a dɔn ko i yɛrɛ don.",
    processing: "A bɛ i ka fɛnw sɛgɛsɛgɛ. I sabali dɛ...",
    completed: "I ka dantɛmɛsɛbɛn sɛgɛsɛgɛli banna. I ni ce!",
    invalidCredentials: "I ka tɔgɔ wala i ka gundo tɛ dɔn. I bɛ sé ka dɔgɔtɔrɔya",
    // Add more translations as needed
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
  const voiceService = VoiceAssistantService.getInstance();

  // Initialize voice service with the current state
  useEffect(() => {
    voiceService.toggleVoice(voiceOverEnabled);
  }, []);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Toggle voice over function
  const toggleVoiceOver = () => {
    const newState = !voiceOverEnabled;
    setVoiceOverEnabled(newState);
    voiceService.toggleVoice(newState);
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

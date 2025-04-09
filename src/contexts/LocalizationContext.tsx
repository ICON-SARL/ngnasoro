
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';

type Language = 'french' | 'bambara';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  voiceOverEnabled: boolean;
  toggleVoiceOver: () => Promise<void>;
  t: (key: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Sample translations
const translations = {
  french: {
    welcome: 'Bienvenue',
    dashboard: 'Tableau de bord',
    settings: 'Paramètres',
    notifications: 'Notifications',
    theme: 'Thème',
    language: 'Langue',
    profile: 'Profil',
    logout: 'Déconnexion',
    // Add more translations as needed
  },
  bambara: {
    welcome: 'Aw ni sɔgɔma',
    dashboard: 'Ɲɛmɔgɔ dashboard',
    settings: 'Labɛnw',
    notifications: 'Kuluw',
    theme: 'Thème',
    language: 'Kan',
    profile: 'Profil',
    logout: 'Ka bɔ',
    // Add more translations as needed
  }
};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings, updateSetting } = useUserSettings();
  const [language, setLanguageState] = useState<Language>('french');
  const [voiceOverEnabled, setVoiceOverEnabled] = useState(false);

  // Initialize language from user settings
  useEffect(() => {
    if (settings?.app_language) {
      setLanguageState(settings.app_language);
    }
  }, [settings]);

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage); // Update state immediately for better UX

    // Only try to update settings if the user is authenticated
    if (settings) {
      try {
        await updateSetting('app_language', newLanguage);
      } catch (error) {
        console.error('Failed to save language preference:', error);
        // State is already updated, so no need to revert
      }
    }
  };

  const toggleVoiceOver = async () => {
    setVoiceOverEnabled(prev => !prev);
    // Here you could save this preference to user settings if needed
  };

  const t = (key: string): string => {
    const currentTranslations = translations[language] || translations.french;
    return currentTranslations[key as keyof typeof currentTranslations] || key;
  };

  return (
    <LocalizationContext.Provider value={{ 
      language, 
      setLanguage, 
      voiceOverEnabled, 
      toggleVoiceOver, 
      t 
    }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

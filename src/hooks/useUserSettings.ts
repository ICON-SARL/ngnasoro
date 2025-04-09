
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from './use-toast';

export interface UserSettings {
  id: string;
  user_id: string;
  push_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  app_language: 'french' | 'bambara';
  theme: 'light' | 'dark' | 'auto';
  offline_mode_enabled: boolean;
}

// Paramètres par défaut
const defaultSettings: Omit<UserSettings, 'id'> = {
  user_id: '',
  push_notifications_enabled: true,
  email_notifications_enabled: false,
  sms_notifications_enabled: true,
  app_language: 'french',
  theme: 'light',
  offline_mode_enabled: false
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserSettings() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Create default settings object with user ID
        const userDefaultSettings = {
          id: 'default',
          user_id: user.id,
          ...defaultSettings
        };

        // Since the table doesn't exist yet, use default settings
        console.log('Using default settings for user:', user.id);
        setSettings(userDefaultSettings);
        setLoading(false);
        
      } catch (error) {
        console.log('Unexpected error in useUserSettings:', error);
        // Use default settings as fallback
        setSettings({
          id: 'default',
          user_id: user.id || 'unknown',
          ...defaultSettings
        });
        setLoading(false);
      }
    }

    fetchUserSettings();
  }, [user]);

  const updateSetting = async <K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ): Promise<boolean> => {
    if (!user?.id || !settings) {
      toast({ 
        title: "Erreur de paramètres",
        description: "Impossible de mettre à jour vos préférences. Veuillez vous reconnecter.",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Update local state only since the table doesn't exist
      setSettings(prev => prev ? { ...prev, [key]: value } : null);
      
      toast({ 
        title: "Paramètre mis à jour",
        description: "Vos préférences ont été enregistrées localement",
      });
      
      return true;
    } catch (error) {
      console.error(`Unexpected error updating ${key}:`, error);
      toast({ 
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de vos préférences",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    settings,
    loading,
    updateSetting
  };
}

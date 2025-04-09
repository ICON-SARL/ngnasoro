
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
        
        // Vérifier si la table existe
        const { error: tableCheckError } = await supabase
          .from('user_settings')
          .select('id')
          .limit(1);
        
        // Si la table n'existe pas, nous utilisons les valeurs par défaut
        if (tableCheckError && tableCheckError.code === '42P01') {
          console.log('Table user_settings does not exist, using default settings');
          setSettings({
            id: 'default',
            user_id: user.id,
            ...defaultSettings
          });
          setLoading(false);
          return;
        }
        
        // Récupérer les paramètres utilisateur
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) {
          console.log('Error fetching user settings, using defaults:', error);
          setSettings({
            id: 'default',
            user_id: user.id,
            ...defaultSettings
          });
        } else if (data) {
          setSettings(data as UserSettings);
        } else {
          // Créer des paramètres par défaut pour l'utilisateur
          const newSettings = {
            user_id: user.id,
            ...defaultSettings
          };
          
          // Tenter de créer les paramètres pour l'utilisateur
          try {
            const { data: createdSettings, error: insertError } = await supabase
              .from('user_settings')
              .insert(newSettings)
              .select('*')
              .single();
              
            if (insertError) {
              console.log('Error creating user settings:', insertError);
              // Utiliser des paramètres par défaut locaux
              setSettings({
                id: 'default',
                ...newSettings
              });
            } else {
              setSettings(createdSettings as UserSettings);
            }
          } catch (createError) {
            console.log('Unexpected error creating settings:', createError);
            setSettings({
              id: 'default',
              ...newSettings
            });
          }
        }
      } catch (error) {
        console.log('Unexpected error in useUserSettings:', error);
        setSettings({
          id: 'default',
          user_id: user.id || 'unknown',
          ...defaultSettings
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUserSettings();
  }, [user, toast]);

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
      // Si nous utilisons des paramètres par défaut locaux, ne pas tenter de mise à jour
      if (settings.id === 'default') {
        // Mise à jour locale uniquement
        setSettings(prev => prev ? { ...prev, [key]: value } : null);
        
        toast({ 
          title: "Paramètre mis à jour",
          description: "Vos préférences ont été enregistrées localement",
        });
        
        return true;
      }
      
      const updateData = { [key]: value, updated_at: new Date().toISOString() };
      
      const { error } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', user.id);
        
      if (error) {
        console.error(`Error updating ${key}:`, error);
        toast({ 
          title: "Erreur",
          description: `Impossible de mettre à jour ${key}`,
          variant: "destructive"
        });
        return false;
      }

      // Update local state
      setSettings(prev => prev ? { ...prev, [key]: value } : null);
      
      toast({ 
        title: "Paramètre mis à jour",
        description: "Vos préférences ont été enregistrées",
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

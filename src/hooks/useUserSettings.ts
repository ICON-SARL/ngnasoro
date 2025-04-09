
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
        
        // Use type assertion to bypass TypeScript's table name checking
        const { data, error } = await supabase
          .from('user_settings' as any)
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user settings:', error);
          // If settings don't exist for the user yet, create them
          if (error.code === 'PGRST116') {
            const { data: newSettings, error: insertError } = await supabase
              .from('user_settings' as any)
              .insert({ user_id: user.id })
              .select('*')
              .single();
              
            if (insertError) {
              console.error('Error creating user settings:', insertError);
            } else {
              setSettings(newSettings as unknown as UserSettings);
            }
          }
        } else {
          setSettings(data as unknown as UserSettings);
        }
      } catch (error) {
        console.error('Unexpected error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserSettings();
  }, [user]);

  const updateSetting = async <K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ): Promise<boolean> => {
    if (!user?.id || !settings?.id) {
      toast({ 
        title: "Erreur de paramètres",
        description: "Impossible de mettre à jour vos préférences. Veuillez vous reconnecter.",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Use type assertions to bypass TypeScript checking
      const updateData = { [key]: value, updated_at: new Date().toISOString() };
      
      const { error } = await supabase
        .from('user_settings' as any)
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

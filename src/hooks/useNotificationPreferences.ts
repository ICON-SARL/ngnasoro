
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences,
  NotificationPreferences,
  NotificationChannel
} from '@/services/notifications/notificationService';

export const useNotificationPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const data = await getNotificationPreferences();
        setPreferences(data);
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos préférences de notification",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const updateChannelPreference = async (
    channelKey: keyof NotificationChannel, 
    enabled: boolean
  ) => {
    if (!preferences) return;
    
    try {
      setSaving(true);
      
      // Create updated preferences
      const updatedPreferences = {
        ...preferences,
        channels: {
          ...preferences.channels,
          [channelKey]: enabled
        }
      };
      
      // Update local state immediately for responsive UI
      setPreferences(updatedPreferences);
      
      // Save to backend
      await updateNotificationPreferences(updatedPreferences);
      
      toast({
        title: "Préférences mises à jour",
        description: `Les notifications par ${channelKey} sont maintenant ${enabled ? 'activées' : 'désactivées'}`,
      });
    } catch (error) {
      console.error('Error updating notification channel:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos préférences",
        variant: "destructive",
      });
      
      // Revert to previous state on error
      const preferencesData = await getNotificationPreferences();
      setPreferences(preferencesData);
    } finally {
      setSaving(false);
    }
  };

  const updateLanguagePreference = async (language: string) => {
    if (!preferences || !language) return;
    
    try {
      setSaving(true);
      
      // Create updated preferences
      const updatedPreferences = {
        ...preferences,
        language
      };
      
      // Update local state immediately for responsive UI
      setPreferences(updatedPreferences);
      
      // Save to backend
      await updateNotificationPreferences(updatedPreferences);
      
      toast({
        title: "Langue modifiée",
        description: `La langue de l'application a été changée pour ${language === 'fr' ? 'Français' : 'Bambara'}`,
      });
    } catch (error) {
      console.error('Error updating language preference:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la langue",
        variant: "destructive",
      });
      
      // Revert to previous state on error
      const preferencesData = await getNotificationPreferences();
      setPreferences(preferencesData);
    } finally {
      setSaving(false);
    }
  };

  const updateCategoryPreference = async (
    categoryKey: string, 
    enabled: boolean
  ) => {
    if (!preferences || !preferences.categories) return;
    
    try {
      setSaving(true);
      
      // Create updated preferences
      const updatedPreferences = {
        ...preferences,
        categories: {
          ...preferences.categories,
          [categoryKey]: enabled
        }
      };
      
      // Update local state immediately for responsive UI
      setPreferences(updatedPreferences);
      
      // Save to backend
      await updateNotificationPreferences(updatedPreferences);
      
      toast({
        title: "Préférences mises à jour",
        description: `Les notifications de type ${categoryKey} sont maintenant ${enabled ? 'activées' : 'désactivées'}`,
      });
    } catch (error) {
      console.error('Error updating notification category:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos préférences",
        variant: "destructive",
      });
      
      // Revert to previous state on error
      const preferencesData = await getNotificationPreferences();
      setPreferences(preferencesData);
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    updateChannelPreference,
    updateLanguagePreference,
    updateCategoryPreference
  };
};

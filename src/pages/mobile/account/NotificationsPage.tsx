import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Bell, Mail, MessageSquare, Volume2, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type NotificationSettings = {
  push: boolean;
  email: boolean;
  sms: boolean;
  sound: boolean;
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    push: true,
    email: false,
    sms: true,
    sound: true
  });
  
  const [language, setLanguage] = useState('fr');
  const [isLoading, setIsLoading] = useState(false);
  
  const saveNotificationSettings = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Create a new notifications object with the updated value
      const updatedNotifications = { ...notifications, [key]: value };
      
      const { data, error } = await supabase.functions.invoke('user_settings', {
        body: {
          action: 'settings',
          method: 'POST',
          notifications: updatedNotifications,
          language: language
        }
      });
      
      if (error) throw error;
      
      setNotifications(updatedNotifications);
      
      toast({
        title: 'Paramètres mis à jour',
        description: 'Vos préférences de notifications ont été enregistrées',
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder vos préférences',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveLanguagePreference = async (value: string) => {
    if (!user || !value) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('user_settings', {
        body: {
          action: 'settings',
          method: 'POST',
          notifications: notifications,
          language: value
        }
      });
      
      if (error) throw error;
      
      setLanguage(value);
      
      toast({
        title: 'Langue modifiée',
        description: `La langue de l'application a été changée pour ${value === 'fr' ? 'Français' : 'Bambara'}`,
      });
    } catch (error) {
      console.error('Error saving language preference:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder vos préférences de langue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load user settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('user_settings', {
          body: { action: 'settings', method: 'GET' }
        });
        
        if (error) throw error;
        
        if (data?.data) {
          if (data.data.notifications) {
            setNotifications(data.data.notifications as NotificationSettings);
          }
          if (data.data.language) {
            setLanguage(data.data.language);
          }
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [user]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/account')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Notifications</h1>
      </div>
      
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-xs text-gray-500">
                  Alertes sur votre téléphone
                </p>
              </div>
            </div>
            <Switch 
              checked={notifications.push} 
              onCheckedChange={(checked) => saveNotificationSettings('push', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Notifications par e-mail</p>
                <p className="text-xs text-gray-500">
                  Résumés et confirmations importantes
                </p>
              </div>
            </div>
            <Switch 
              checked={notifications.email} 
              onCheckedChange={(checked) => saveNotificationSettings('email', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Notifications par SMS</p>
                <p className="text-xs text-gray-500">
                  Pour les alertes critiques uniquement
                </p>
              </div>
            </div>
            <Switch 
              checked={notifications.sms} 
              onCheckedChange={(checked) => saveNotificationSettings('sms', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Son des notifications</p>
                <p className="text-xs text-gray-500">
                  Activer les alertes sonores
                </p>
              </div>
            </div>
            <Switch 
              checked={notifications.sound} 
              onCheckedChange={(checked) => saveNotificationSettings('sound', checked)} 
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <Globe className="h-5 w-5" />
            </div>
            <p className="font-medium">Langue de l'application</p>
          </div>
          
          <ToggleGroup 
            type="single" 
            value={language} 
            onValueChange={(value) => {
              if (value) saveLanguagePreference(value);
            }} 
            className="justify-start"
          >
            <ToggleGroupItem value="fr" className="text-sm">Français</ToggleGroupItem>
            <ToggleGroupItem value="bm" className="text-sm">Bambara</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

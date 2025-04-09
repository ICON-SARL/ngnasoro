
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useUserSettings } from '@/hooks/useUserSettings';

const NotificationsSection = () => {
  const { toast } = useToast();
  const { settings, loading, updateSetting } = useUserSettings();
  
  const handleToggleNotification = async (type: 'push' | 'email' | 'sms', checked: boolean) => {
    let settingKey: 'push_notifications_enabled' | 'email_notifications_enabled' | 'sms_notifications_enabled';
    
    switch (type) {
      case 'push':
        settingKey = 'push_notifications_enabled';
        break;
      case 'email':
        settingKey = 'email_notifications_enabled';
        break;
      case 'sms':
        settingKey = 'sms_notifications_enabled';
        break;
    }
    
    const success = await updateSetting(settingKey, checked);
    
    if (success) {
      toast({
        title: `Notifications ${type}`,
        description: `Les notifications par ${type} ont été ${checked ? 'activées' : 'désactivées'}`,
      });
    }
  };

  const handleLanguageChange = async (value: string) => {
    if (value !== 'fr' && value !== 'bm') return;
    
    const language = value === 'fr' ? 'french' : 'bambara';
    const success = await updateSetting('app_language', language);
    
    if (success) {
      toast({
        title: "Langue modifiée",
        description: `La langue de l'application a été changée pour ${language === 'french' ? 'Français' : 'Bambara'}`,
      });
    }
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Notifications & Préférences</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Chargement des préférences...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Notifications & Préférences</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-xs text-gray-500">
                  Alertes sur votre téléphone
                </p>
              </div>
            </div>
            <Switch 
              checked={settings?.push_notifications_enabled ?? true} 
              onCheckedChange={(checked) => handleToggleNotification('push', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Notifications par e-mail</p>
                <p className="text-xs text-gray-500">
                  Résumés et confirmations importantes
                </p>
              </div>
            </div>
            <Switch 
              checked={settings?.email_notifications_enabled ?? false}
              onCheckedChange={(checked) => handleToggleNotification('email', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Notifications par SMS</p>
                <p className="text-xs text-gray-500">
                  Pour les alertes critiques uniquement
                </p>
              </div>
            </div>
            <Switch 
              checked={settings?.sms_notifications_enabled ?? true}
              onCheckedChange={(checked) => handleToggleNotification('sms', checked)} 
            />
          </div>
          
          <div className="mt-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Globe className="h-4 w-4" />
              </div>
              <p className="font-medium">Langue de l'application</p>
            </div>
            
            <ToggleGroup 
              type="single" 
              value={settings?.app_language === 'bambara' ? 'bm' : 'fr'}
              onValueChange={handleLanguageChange} 
              className="justify-start"
            >
              <ToggleGroupItem value="fr" className="text-sm">Français</ToggleGroupItem>
              <ToggleGroupItem value="bm" className="text-sm">Bambara</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsSection;

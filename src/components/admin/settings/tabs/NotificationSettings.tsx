
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SystemConfig } from '../types';

interface NotificationSettingsProps {
  config: SystemConfig;
  handleChange: (field: keyof SystemConfig, value: any) => void;
  isEditing: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  config, 
  handleChange, 
  isEditing 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres de Notifications</CardTitle>
        <CardDescription>
          Configurez les options de notification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="enableNotifications"
            checked={config.enableNotifications}
            onCheckedChange={(checked) => handleChange('enableNotifications', checked)}
            disabled={!isEditing}
          />
          <Label htmlFor="enableNotifications">Activer les notifications système</Label>
        </div>
      </CardContent>
    </Card>
  );
};

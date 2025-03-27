
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SystemConfig } from '../types';

interface SecuritySettingsProps {
  config: SystemConfig;
  handleChange: (field: keyof SystemConfig, value: any) => void;
  isEditing: boolean;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ 
  config, 
  handleChange, 
  isEditing 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres de Sécurité</CardTitle>
        <CardDescription>
          Configurez les options de sécurité du système
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxLoginAttempts">Nombre maximum de tentatives de connexion</Label>
            <Input
              id="maxLoginAttempts"
              type="number"
              value={config.maxLoginAttempts}
              onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
              disabled={!isEditing}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Délai d'expiration de session (minutes)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={config.sessionTimeoutMinutes}
              onChange={(e) => handleChange('sessionTimeoutMinutes', parseInt(e.target.value))}
              disabled={!isEditing}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="passwordExpiry">Expiration de mot de passe (jours)</Label>
            <Input
              id="passwordExpiry"
              type="number"
              value={config.passwordExpireDays}
              onChange={(e) => handleChange('passwordExpireDays', parseInt(e.target.value))}
              disabled={!isEditing}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

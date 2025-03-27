
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SystemConfig } from '../types';

interface GeneralSettingsProps {
  config: SystemConfig;
  handleChange: (field: keyof SystemConfig, value: any) => void;
  isEditing: boolean;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ 
  config, 
  handleChange, 
  isEditing 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres Généraux</CardTitle>
        <CardDescription>
          Configurez les paramètres de base du système
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="systemEmail">Adresse Email Système</Label>
            <Input
              id="systemEmail"
              value={config.systemEmailAddress}
              onChange={(e) => handleChange('systemEmailAddress', e.target.value)}
              disabled={!isEditing}
            />
            <p className="text-xs text-muted-foreground">
              Utilisée pour les notifications système
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="defaultCurrency">Devise par Défaut</Label>
            <Input
              id="defaultCurrency"
              value={config.defaultCurrency}
              onChange={(e) => handleChange('defaultCurrency', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="maintenanceMode"
            checked={config.maintenanceMode}
            onCheckedChange={(checked) => handleChange('maintenanceMode', checked)}
            disabled={!isEditing}
          />
          <Label htmlFor="maintenanceMode">Mode Maintenance</Label>
          <span className="text-sm text-muted-foreground ml-2">
            {config.maintenanceMode ? 'Activé' : 'Désactivé'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

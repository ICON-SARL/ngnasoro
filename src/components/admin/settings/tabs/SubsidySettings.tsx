
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SystemConfig } from '../types';

interface SubsidySettingsProps {
  config: SystemConfig;
  handleChange: (field: keyof SystemConfig, value: any) => void;
  isEditing: boolean;
}

export const SubsidySettings: React.FC<SubsidySettingsProps> = ({ 
  config, 
  handleChange, 
  isEditing 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres des Subventions</CardTitle>
        <CardDescription>
          Configurez les règles pour les subventions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="subsidyApproval"
            checked={config.subsidyApprovalRequired}
            onCheckedChange={(checked) => handleChange('subsidyApprovalRequired', checked)}
            disabled={!isEditing}
          />
          <Label htmlFor="subsidyApproval">Approbation requise pour les subventions</Label>
        </div>
      </CardContent>
    </Card>
  );
};

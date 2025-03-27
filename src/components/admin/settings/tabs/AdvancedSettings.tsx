
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Cog } from 'lucide-react';
import { SystemConfig } from '../types';

interface AdvancedSettingsProps {
  config: SystemConfig;
  handleChange: (field: keyof SystemConfig, value: any) => void;
  isEditing: boolean;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ 
  config, 
  handleChange, 
  isEditing 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres Avancés</CardTitle>
        <CardDescription>
          Options avancées pour les administrateurs système
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="logLevel">Niveau de journalisation</Label>
          <select
            id="logLevel"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={config.logLevel}
            onChange={(e) => handleChange('logLevel', e.target.value)}
            disabled={!isEditing}
          >
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="sfdRegistrationApproval"
            checked={config.sfdRegistrationApproval}
            onCheckedChange={(checked) => handleChange('sfdRegistrationApproval', checked)}
            disabled={!isEditing}
          />
          <Label htmlFor="sfdRegistrationApproval">
            Nécessite l'approbation pour l'enregistrement des SFD
          </Label>
        </div>
        
        <Collapsible className="space-y-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Options de développement</span>
              <Cog className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 rounded-md border p-4">
            <div className="text-sm text-muted-foreground">
              Ces options sont destinées uniquement aux développeurs système.
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="devMode" disabled={!isEditing} />
              <Label htmlFor="devMode">Mode développeur</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="debugApi" disabled={!isEditing} />
              <Label htmlFor="debugApi">Activer le débogage API</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

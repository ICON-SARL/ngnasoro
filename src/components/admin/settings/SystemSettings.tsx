
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Shield, Settings, Database, Bell, Lock, Zap, Globe, Cog } from 'lucide-react';

export interface SystemConfig {
  sfdRegistrationApproval: boolean;
  maxLoginAttempts: number;
  sessionTimeoutMinutes: number;
  maintenanceMode: boolean;
  systemEmailAddress: string;
  passwordExpireDays: number;
  enableNotifications: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  subsidyApprovalRequired: boolean;
  defaultCurrency: string;
}

export function SystemSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  
  // Initial system configuration values
  const [config, setConfig] = useState<SystemConfig>({
    sfdRegistrationApproval: true,
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 30,
    maintenanceMode: false,
    systemEmailAddress: 'admin@meref.sn',
    passwordExpireDays: 90,
    enableNotifications: true,
    logLevel: 'info',
    subsidyApprovalRequired: true,
    defaultCurrency: 'XOF',
  });

  const handleChange = (field: keyof SystemConfig, value: any) => {
    setConfig({
      ...config,
      [field]: value,
    });
  };

  const handleSave = () => {
    // Here you would save the configuration to your backend
    console.log('Saving configuration:', config);
    
    // Show success toast
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres système ont été mis à jour avec succès.",
    });
    
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Paramètres Système</h2>
          <p className="text-muted-foreground">
            Configurez les paramètres globaux du système MEREF
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                Sauvegarder
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Cog className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="subsidies">
            <Shield className="h-4 w-4 mr-2" />
            Subventions
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Zap className="h-4 w-4 mr-2" />
            Avancé
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="subsidies" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

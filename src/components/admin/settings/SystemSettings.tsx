
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { SettingsHeader } from './SettingsHeader';
import { SettingsTabs } from './SettingsTabs';
import { GeneralSettings } from './tabs/GeneralSettings';
import { SecuritySettings } from './tabs/SecuritySettings';
import { NotificationSettings } from './tabs/NotificationSettings';
import { SubsidySettings } from './tabs/SubsidySettings';
import { AdvancedSettings } from './tabs/AdvancedSettings';
import { SystemConfig } from './types';
import { 
  exportConfigToJson, 
  importConfigFromJson 
} from './utils/settingsExportImport';

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

  const handleExport = () => {
    exportConfigToJson(config);
    
    toast({
      title: "Exportation réussie",
      description: "Les paramètres système ont été exportés avec succès.",
    });
  };

  const handleImport = async () => {
    try {
      const importedConfig = await importConfigFromJson();
      setConfig(importedConfig);
      
      toast({
        title: "Importation réussie",
        description: "Les paramètres système ont été importés avec succès.",
      });
      
      // Start editing mode to review the imported settings
      setIsEditing(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'importation",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'importation",
      });
    }
  };

  return (
    <div className="space-y-6">
      <SettingsHeader 
        isEditing={isEditing} 
        setIsEditing={setIsEditing} 
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings 
            config={config} 
            handleChange={handleChange} 
            isEditing={isEditing} 
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySettings 
            config={config} 
            handleChange={handleChange} 
            isEditing={isEditing} 
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings 
            config={config} 
            handleChange={handleChange} 
            isEditing={isEditing} 
          />
        </TabsContent>

        <TabsContent value="subsidies" className="space-y-4">
          <SubsidySettings 
            config={config} 
            handleChange={handleChange} 
            isEditing={isEditing} 
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <AdvancedSettings 
            config={config} 
            handleChange={handleChange} 
            isEditing={isEditing} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

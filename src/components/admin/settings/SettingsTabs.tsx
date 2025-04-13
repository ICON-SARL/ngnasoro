
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Lock, Bell, Shield, Zap } from 'lucide-react';

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
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
    </Tabs>
  );
};

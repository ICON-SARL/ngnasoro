
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Lock, Bell, Shield, Zap } from 'lucide-react';

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <TabsList>
      <TabsTrigger value="general" onClick={() => onTabChange('general')}>
        <Settings className="h-4 w-4 mr-2" />
        Général
      </TabsTrigger>
      <TabsTrigger value="security" onClick={() => onTabChange('security')}>
        <Lock className="h-4 w-4 mr-2" />
        Sécurité
      </TabsTrigger>
      <TabsTrigger value="notifications" onClick={() => onTabChange('notifications')}>
        <Bell className="h-4 w-4 mr-2" />
        Notifications
      </TabsTrigger>
      <TabsTrigger value="subsidies" onClick={() => onTabChange('subsidies')}>
        <Shield className="h-4 w-4 mr-2" />
        Subventions
      </TabsTrigger>
      <TabsTrigger value="advanced" onClick={() => onTabChange('advanced')}>
        <Zap className="h-4 w-4 mr-2" />
        Avancé
      </TabsTrigger>
    </TabsList>
  );
};


import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SfdSettingsForm } from './SfdSettingsForm';
import { SfdMetricsCard } from './SfdMetricsCard';

interface SfdSettingsManagerProps {
  sfdId: string;
}

export function SfdSettingsManager({ sfdId }: SfdSettingsManagerProps) {
  return (
    <Tabs defaultValue="metrics" className="space-y-4">
      <TabsList>
        <TabsTrigger value="metrics">Métriques</TabsTrigger>
        <TabsTrigger value="settings">Paramètres</TabsTrigger>
      </TabsList>
      <TabsContent value="metrics">
        <SfdMetricsCard sfdId={sfdId} />
      </TabsContent>
      <TabsContent value="settings">
        <SfdSettingsForm sfdId={sfdId} />
      </TabsContent>
    </Tabs>
  );
}

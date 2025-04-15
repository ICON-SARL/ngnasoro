import React from 'react';
import { useCurrentSfd } from '@/hooks/useCurrentSfd';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdStats } from '@/hooks/useSfdStats';
import { SfdDashboard } from '@/components/sfd/SfdDashboard';
import { SyncStatusIndicator } from '@/components/sync/SyncStatusIndicator';
import { PermissionSyncStatus } from '@/components/sync/PermissionSyncStatus';
import { SfdStatCards } from '@/components/sfd/dashboard/SfdStatCards';
import { SfdInfoTab } from '@/components/sfd/tabs/SfdInfoTab';
import { SfdSettingsTab } from '@/components/sfd/tabs/SfdSettingsTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExtendedSfd } from '@/types/sfd-types';

export default function AgencyManagementPage() {
  const { data: sfd, isLoading: sfdLoading } = useCurrentSfd();
  const { data: stats, isLoading: statsLoading } = useSfdStats(sfd?.id);
  const { user, userRole } = useAuth();
  const isLoading = sfdLoading || statsLoading;

  console.log("AgencyManagementPage - Data loading state:", {
    sfdLoading,
    statsLoading,
    sfdId: sfd?.id,
    userRole,
    userId: user?.id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
        <span>Chargement des données SFD...</span>
      </div>
    );
  }

  if (!sfd) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600">Aucune SFD associée</h1>
          <p className="mt-2">
            Votre compte n'est pas encore associé à une SFD. Veuillez contacter l'administrateur système.
          </p>
        </div>
      </div>
    );
  }

  const typedSfd = sfd as unknown as ExtendedSfd;
  const settings = typedSfd.settings || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Gestion de {typedSfd.name}</h1>
              <p className="text-muted-foreground">
                Configuration et paramètres de votre SFD
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <SyncStatusIndicator />
              <PermissionSyncStatus />
            </div>
          </div>
        </div>

        <SfdStatCards stats={stats} />

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="admins">Administrateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <SfdInfoTab sfd={typedSfd} />
          </TabsContent>

          <TabsContent value="dashboard">
            <SfdDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <SfdSettingsTab settings={settings} />
          </TabsContent>

          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>Administrateurs de la SFD</CardTitle>
              </CardHeader>
              <CardContent>
                <p>La gestion des administrateurs sera disponible prochainement.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

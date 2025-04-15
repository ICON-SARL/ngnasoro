
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import ClientsOverview from '../admin/clients/ClientsOverview';
import { StatsOverview } from '../admin/dashboard/StatsOverview';
import { SfdAccountsManager } from '../admin/sfd-accounts/SfdAccountsManager';
import { SfdStatusAlert } from '../admin/dashboard/SfdStatusAlert';
import { useSfdStatusCheck } from '@/hooks/useSfdStatusCheck';
import { SfdInfoCard } from './SfdInfoCard';
import { useCurrentSfd } from '@/hooks/useCurrentSfd';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';

const SfdAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { data: sfdStatus } = useSfdStatusCheck();
  const { data: currentSfd, isLoading: isLoadingSfd } = useCurrentSfd();

  const handleManageSfd = () => {
    navigate('/agency-management');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord SFD</h1>
          <p className="text-muted-foreground">
            {user?.email ? `Connecté en tant que ${user.email}` : 'Bienvenue dans votre tableau de bord SFD'}
          </p>
        </div>
        
        <LogoutButton 
          variant="destructive"
          className="hover:bg-red-700"
          text="Se déconnecter"
          redirectPath="/auth"
        />
      </div>
      
      {isLoadingSfd ? (
        <Skeleton className="h-[200px] w-full" />
      ) : currentSfd ? (
        <SfdInfoCard sfd={currentSfd} onManage={handleManageSfd} />
      ) : null}

      {sfdStatus && !sfdStatus.hasActiveSfds && (
        <SfdStatusAlert />
      )}
      
      <Tabs 
        defaultValue={activeTab} 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList className="grid md:grid-cols-4 grid-cols-2 w-full">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="accounts">Comptes SFD</TabsTrigger>
          <TabsTrigger value="loans">Prêts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <StatsOverview />
        </TabsContent>
        
        <TabsContent value="clients" className="space-y-6">
          <ClientsOverview />
        </TabsContent>
        
        <TabsContent value="accounts" className="space-y-6">
          <SfdAccountsManager />
        </TabsContent>
        
        <TabsContent value="loans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prêts en cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p>La gestion des prêts sera disponible prochainement.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="mt-8 p-4 bg-white shadow-sm text-center">
        <CardHeader>
          <CardTitle>Besoin de vous déconnecter ?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Cliquez sur le bouton ci-dessous pour vous déconnecter en toute sécurité.</p>
          <LogoutButton 
            variant="destructive"
            size="lg"
            className="min-w-[200px]"
            text="Déconnexion Sécurisée"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdAdminDashboard;

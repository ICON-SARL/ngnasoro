import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CalendarDays, CreditCard, Users, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LogoutButton from '@/components/LogoutButton';
import { useSfdStatistics } from '@/hooks/useSfdStatistics';

const AgencyDashboardPage = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useSfdStatistics();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord SFD</h1>
            <p className="text-gray-500">
              Bienvenue, {user?.user_metadata?.full_name || user?.email || 'Admin'}
            </p>
          </div>
          
          <LogoutButton 
            variant="outline" 
            className="border-red-200 hover:bg-red-50"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clients Totaux</CardTitle>
              <CardDescription>Nombre total de clients actifs</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Chargement...</span>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats?.clientsTotal || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    +{stats?.clientsNewThisMonth || 0} ce mois
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prêts Actifs</CardTitle>
              <CardDescription>Nombre total de prêts en cours</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Chargement...</span>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats?.activeLoans || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    {stats?.pendingApprovalLoans || 0} en attente d'approbation
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Demandes de Subvention</CardTitle>
              <CardDescription>Aperçu des demandes de subvention</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Chargement...</span>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats?.subsidyRequests || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    {stats?.pendingSubsidyRequests || 0} en attente d'approbation
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
              <TabsTrigger value="analytics">Analytique</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-2">
              <h3 className="text-lg font-semibold">Aperçu Général</h3>
              <p>Informations générales sur l'activité récente.</p>
            </TabsContent>
            <TabsContent value="reports" className="space-y-2">
              <h3 className="text-lg font-semibold">Rapports Détaillés</h3>
              <p>Consultez les rapports financiers et opérationnels.</p>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-2">
              <h3 className="text-lg font-semibold">Analytique Avancée</h3>
              <p>Analysez les données pour prendre des décisions éclairées.</p>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="mt-8 text-center">
          <LogoutButton 
            variant="outline" 
            className="border-red-200 hover:bg-red-50 min-w-[200px]"
            text="Déconnexion"
          />
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboardPage;

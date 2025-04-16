import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { CalendarDays, CreditCard, Users, Clock, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LogoutButton from '@/components/LogoutButton';

const AgencyDashboardPage = () => {
  const { user } = useAuth();
  
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Clients Totaux</CardTitle>
              <CardDescription>Nombre total de clients actifs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1250</div>
            </CardContent>
            <CardFooter className="text-right">
              <Button variant="secondary" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Voir les clients
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Prêts Actifs</CardTitle>
              <CardDescription>Nombre total de prêts en cours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">320</div>
            </CardContent>
            <CardFooter className="text-right">
              <Button variant="secondary" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                Voir les prêts
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Dernières Transactions</CardTitle>
              <CardDescription>Aperçu des transactions récentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">78</div>
            </CardContent>
            <CardFooter className="text-right">
              <Button variant="secondary" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Voir les transactions
              </Button>
            </CardFooter>
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
        
        {/* Explicit logout button at the bottom */}
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

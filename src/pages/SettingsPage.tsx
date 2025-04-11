
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgencyHeader } from '@/components/AgencyHeader';

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-semibold mb-6">Paramètres</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Configuration du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="security">Sécurité</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="appearance">Apparence</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="py-4">
                <h3 className="text-lg font-medium mb-4">Paramètres du profil</h3>
                <p className="text-gray-600 mb-4">
                  Vous pourrez modifier vos informations personnelles et paramètres de compte ici.
                </p>
              </TabsContent>
              
              <TabsContent value="security" className="py-4">
                <h3 className="text-lg font-medium mb-4">Paramètres de sécurité</h3>
                <p className="text-gray-600 mb-4">
                  Gérez votre mot de passe, l'authentification à deux facteurs et les options de sécurité.
                </p>
              </TabsContent>
              
              <TabsContent value="notifications" className="py-4">
                <h3 className="text-lg font-medium mb-4">Préférences de notification</h3>
                <p className="text-gray-600 mb-4">
                  Contrôlez les notifications par email, SMS et application mobile.
                </p>
              </TabsContent>
              
              <TabsContent value="appearance" className="py-4">
                <h3 className="text-lg font-medium mb-4">Apparence de l'interface</h3>
                <p className="text-gray-600 mb-4">
                  Personnalisez l'interface utilisateur selon vos préférences.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;

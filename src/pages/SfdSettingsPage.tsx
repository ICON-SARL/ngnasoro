
import React, { useState } from 'react';
import { SfdHeader } from '@/components/SfdHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoanPlanManagement } from '@/components/sfd/LoanPlanManagement';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, Settings, CreditCard, Building, ShieldCheck, Bell, Users
} from 'lucide-react';

const SfdSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('loan-plans');

  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Paramètres SFD</h2>
          <p className="text-muted-foreground">
            Gérez vos paramètres SFD, plans de prêt et autres configurations
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="space-y-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical">
                  <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
                    <TabsTrigger 
                      value="loan-plans" 
                      className={`w-full justify-start px-3 ${activeTab === 'loan-plans' ? 'bg-gray-100' : 'bg-transparent'}`}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Plans de Prêt
                    </TabsTrigger>
                    <TabsTrigger 
                      value="agency-settings" 
                      className={`w-full justify-start px-3 ${activeTab === 'agency-settings' ? 'bg-gray-100' : 'bg-transparent'}`}
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Paramètres Agence
                    </TabsTrigger>
                    <TabsTrigger 
                      value="security" 
                      className={`w-full justify-start px-3 ${activeTab === 'security' ? 'bg-gray-100' : 'bg-transparent'}`}
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Sécurité
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notifications" 
                      className={`w-full justify-start px-3 ${activeTab === 'notifications' ? 'bg-gray-100' : 'bg-transparent'}`}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger 
                      value="users" 
                      className={`w-full justify-start px-3 ${activeTab === 'users' ? 'bg-gray-100' : 'bg-transparent'}`}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Utilisateurs
                    </TabsTrigger>
                    <TabsTrigger 
                      value="documents" 
                      className={`w-full justify-start px-3 ${activeTab === 'documents' ? 'bg-gray-100' : 'bg-transparent'}`}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </nav>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 lg:col-span-3">
            <CardContent className="p-6">
              <Tabs value={activeTab} className="w-full">
                <TabsContent value="loan-plans">
                  <LoanPlanManagement />
                </TabsContent>
                
                <TabsContent value="agency-settings">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Paramètres de l'Agence</h3>
                    <p className="text-muted-foreground">
                      Configuration des informations de l'agence, coordonnées et règles opérationnelles.
                    </p>
                    <Separator />
                    <div className="py-8 text-center text-muted-foreground">
                      Fonctionnalité en cours de développement
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Paramètres de Sécurité</h3>
                    <p className="text-muted-foreground">
                      Configuration des règles de sécurité, authentification et autorisations.
                    </p>
                    <Separator />
                    <div className="py-8 text-center text-muted-foreground">
                      Fonctionnalité en cours de développement
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Paramètres de Notification</h3>
                    <p className="text-muted-foreground">
                      Configuration des notifications par email, SMS et dans l'application.
                    </p>
                    <Separator />
                    <div className="py-8 text-center text-muted-foreground">
                      Fonctionnalité en cours de développement
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="users">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Gestion des Utilisateurs</h3>
                    <p className="text-muted-foreground">
                      Gérez les utilisateurs de l'agence et leurs permissions.
                    </p>
                    <Separator />
                    <div className="py-8 text-center text-muted-foreground">
                      Fonctionnalité en cours de développement
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Gestion des Documents</h3>
                    <p className="text-muted-foreground">
                      Configurez les modèles de documents et les règles de stockage.
                    </p>
                    <Separator />
                    <div className="py-8 text-center text-muted-foreground">
                      Fonctionnalité en cours de développement
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SfdSettingsPage;

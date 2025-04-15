
import React from 'react';
import { useCurrentSfd } from '@/hooks/useCurrentSfd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SfdHeader } from '@/components/sfd/SfdHeader';

export default function AgencyManagementPage() {
  const { data: sfd, isLoading } = useCurrentSfd();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!sfd) {
    return <div>Aucune SFD trouvée</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion de {sfd.name}</h1>
          <p className="text-muted-foreground">
            Configuration et paramètres de votre SFD
          </p>
        </div>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="admins">Administrateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations de la SFD</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Nom</p>
                  <p className="text-muted-foreground">{sfd.name}</p>
                </div>
                <div>
                  <p className="font-medium">Code</p>
                  <p className="text-muted-foreground">{sfd.code}</p>
                </div>
                {sfd.region && (
                  <div>
                    <p className="font-medium">Région</p>
                    <p className="text-muted-foreground">{sfd.region}</p>
                  </div>
                )}
                {sfd.contact_email && (
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">{sfd.contact_email}</p>
                  </div>
                )}
                {sfd.phone && (
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-muted-foreground">{sfd.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de la SFD</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Les paramètres seront disponibles prochainement.</p>
              </CardContent>
            </Card>
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

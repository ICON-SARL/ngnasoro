
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SfdAdminManager } from '@/components/admin/sfd/SfdAdminManager';

interface SfdDetailProps {
  selectedSfd: any | null;
  onEdit: (sfd: any) => void;
}

export function SfdDetail({ selectedSfd, onEdit }: SfdDetailProps) {
  const [activeTab, setActiveTab] = useState('list');

  if (!selectedSfd) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Sélectionnez une SFD pour afficher ses détails</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            {selectedSfd.logo_url && (
              <img src={selectedSfd.logo_url} alt={selectedSfd.name} className="h-6 w-6 rounded-full" />
            )}
            {selectedSfd.name}
          </CardTitle>
          <CardDescription>
            Code: {selectedSfd.code} • Région: {selectedSfd.region || 'Non spécifiée'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(selectedSfd)}>
            Modifier
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="list">Informations</TabsTrigger>
            <TabsTrigger value="admins">
              <UserPlus className="h-4 w-4 mr-1" />
              Administrateurs
            </TabsTrigger>
            <TabsTrigger value="subsidies">Subventions</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
                  <p>{selectedSfd.status === 'active' ? 'Actif' : selectedSfd.status === 'pending' ? 'En attente' : 'Inactif'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date de création</h3>
                  <p>{new Date(selectedSfd.created_at).toLocaleDateString()}</p>
                </div>
                {selectedSfd.contact_email && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email de contact</h3>
                    <p>{selectedSfd.contact_email}</p>
                  </div>
                )}
                {selectedSfd.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Téléphone</h3>
                    <p>{selectedSfd.phone}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Dernière mise à jour</h3>
                  <p>{selectedSfd.updated_at ? new Date(selectedSfd.updated_at).toLocaleDateString() : 'Jamais'}</p>
                </div>
                {selectedSfd.description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p>{selectedSfd.description}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="admins">
            <SfdAdminManager sfdId={selectedSfd.id} sfdName={selectedSfd.name} />
          </TabsContent>
          
          <TabsContent value="subsidies">
            <div className="text-center p-4 text-muted-foreground">
              Informations sur les subventions à venir
            </div>
          </TabsContent>
          
          <TabsContent value="clients">
            <div className="text-center p-4 text-muted-foreground">
              Informations sur les clients à venir
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

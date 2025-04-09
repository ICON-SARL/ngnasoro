
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { PermissionsTable } from '@/components/admin/PermissionsTable';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Settings, Users, Building, Layers } from 'lucide-react';

const SystemPermissionsPage = () => {
  const { isAdmin, isSfdAdmin } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <SfdHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Structure des Permissions</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de la hiérarchie des rôles et des permissions dans le système
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Hiérarchie des Rôles</CardTitle>
              <CardDescription>
                Organisation des niveaux d'accès dans l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">MEREF (Super Admin)</h3>
                      <p className="text-sm text-muted-foreground">
                        Contrôle macro (règles, conformité). Supervision générale du système et des SFDs.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Building className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">Admin SFD</h3>
                      <p className="text-sm text-muted-foreground">
                        Gestion opérationnelle de la SFD (clients, prêts). Administration des utilisateurs internes.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">Personnel SFD (Caissiers, Agents)</h3>
                      <p className="text-sm text-muted-foreground">
                        Opérations quotidiennes selon le rôle attribué. Accès limité aux fonctionnalités selon besoin.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Layers className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">Clients</h3>
                      <p className="text-sm text-muted-foreground">
                        Interactions self-service. Consultation de compte, demandes de prêt, suivi des opérations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <PermissionsTable showDescription={true} />
          
          <Card>
            <CardHeader>
              <CardTitle>Éléments Techniques</CardTitle>
              <CardDescription>
                Composants techniques pour l'intégration et la synchronisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">API MEREF → SFD</h3>
                  <p className="text-sm text-muted-foreground">
                    Endpoint pour pousser les mises à jour réglementaires vers les SFDs.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Webhooks</h3>
                  <p className="text-sm text-muted-foreground">
                    Système de synchronisation des paiements Mobile Money avec la base de données.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">UI/UX</h3>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    <li>Dashboard MEREF: Carte interactive des SFDs</li>
                    <li>Espace Admin SFD: Vue simplifiée pour les caissiers</li>
                    <li>Interface client: Accès mobile optimisé</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemPermissionsPage;

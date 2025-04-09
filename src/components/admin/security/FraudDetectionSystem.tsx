
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldAlertIcon, 
  AlertTriangleIcon, 
  SearchIcon,
  UserXIcon,
  ClockIcon
} from 'lucide-react';

export const FraudDetectionSystem = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldAlertIcon className="mr-2 h-6 w-6 text-primary" />
            Système de Détection de Fraude
          </CardTitle>
          <CardDescription>
            Surveillance des transactions suspectes et vérification d'identité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alerts">
            <TabsList className="mb-4">
              <TabsTrigger value="alerts">Alertes</TabsTrigger>
              <TabsTrigger value="transactions">Transactions suspectes</TabsTrigger>
              <TabsTrigger value="verification">Vérification d'identité</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
            
            <TabsContent value="alerts">
              <Alert variant="destructive" className="mb-4">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertTitle>Alerte Haute Priorité</AlertTitle>
                <AlertDescription>
                  Détection de multiples retraits dans 3 agences différentes pour le même client 
                  en moins de 2 heures - Client ID: #45892
                </AlertDescription>
              </Alert>
              
              <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200">
                <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
                <AlertTitle>Documents Potentiellement Falsifiés</AlertTitle>
                <AlertDescription>
                  Incohérences détectées dans les documents KYC soumis par un nouveau client - 
                  SFD: MicroFinance Ouest - Demande ID: #78541
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Alertes Aujourd'hui</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-red-500">+3</span> depuis hier
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Fraudes Confirmées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">23</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ce mois
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Temps de Réponse</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1.5h</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Temps moyen de résolution
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="transactions">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horodatage</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>SFD</TableHead>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Indicateurs</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>10:25 AM</span>
                        </div>
                      </TableCell>
                      <TableCell>Amadou Diop</TableCell>
                      <TableCell>CréditPlus</TableCell>
                      <TableCell>Retrait</TableCell>
                      <TableCell>500,000 FCFA</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs border-red-300 text-red-700">Montant inhabituel</Badge>
                          <Badge variant="outline" className="text-xs border-red-300 text-red-700">Lieu inhabituel</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300">En revue</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center">
                          <ClockIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>09:47 AM</span>
                        </div>
                      </TableCell>
                      <TableCell>Marie Koné</TableCell>
                      <TableCell>MicroFinance Est</TableCell>
                      <TableCell>Transfert</TableCell>
                      <TableCell>250,000 FCFA</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs border-red-300 text-red-700">Destinataire flaggé</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800 border-red-300">Bloqué</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="verification">
              <div className="flex items-center justify-between mb-4 p-4 border rounded-lg">
                <div className="flex items-center">
                  <SearchIcon className="h-8 w-8 p-1 mr-3 bg-blue-100 text-blue-700 rounded-full" />
                  <div>
                    <h3 className="font-medium">SHIFT Africa KYC</h3>
                    <p className="text-sm text-muted-foreground">
                      Intégration active pour la vérification d'identité
                    </p>
                  </div>
                </div>
                <Badge>Connecté</Badge>
              </div>
              
              <div className="flex items-center justify-between mb-4 p-4 border rounded-lg">
                <div className="flex items-center">
                  <UserXIcon className="h-8 w-8 p-1 mr-3 bg-blue-100 text-blue-700 rounded-full" />
                  <div>
                    <h3 className="font-medium">Liste Noire Régionale</h3>
                    <p className="text-sm text-muted-foreground">
                      Base de données partagée des fraudeurs identifiés
                    </p>
                  </div>
                </div>
                <Badge>Connecté</Badge>
              </div>
              
              <Alert variant="default" className="bg-blue-50 border border-blue-200 mt-4">
                <AlertTitle>Vérification automatique</AlertTitle>
                <AlertDescription>
                  Toutes les nouvelles demandes de compte et de prêt sont automatiquement 
                  vérifiées avec les systèmes intégrés.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="text-center py-12 text-muted-foreground">
                Configuration des seuils d'alerte et des règles de détection
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

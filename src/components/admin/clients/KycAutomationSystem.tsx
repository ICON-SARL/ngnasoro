
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Fingerprint, UserCheck, Scan, Settings2, Camera, CheckCheck, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const KycAutomationSystem = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Fingerprint className="mr-2 h-6 w-6 text-primary" />
          KYC Automatisé
        </CardTitle>
        <CardDescription>
          Vérification d'identité et validation des clients en temps réel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="verification">
          <TabsList className="mb-4">
            <TabsTrigger value="verification">Vérification</TabsTrigger>
            <TabsTrigger value="pending">En attente (12)</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="settings">Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="verification" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Vérifications aujourd'hui</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <div className="flex items-center text-xs text-green-600">
                    <CheckCheck className="h-3 w-3 mr-1" />
                    <span>92% de taux de réussite</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Temps de vérification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45s</div>
                  <p className="text-xs text-muted-foreground">Temps moyen</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Statut de l'API</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div className="text-sm font-medium">Opérationnelle</div>
                  </div>
                  <p className="text-xs text-muted-foreground">Dernière mise à jour: 5 min</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <UserCheck className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">SHIFT Africa API</h3>
                      <p className="text-sm text-muted-foreground">Vérification d'identité biométrique</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge className="mr-2 bg-green-100 text-green-800">Active</Badge>
                    <Switch checked={true} />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Camera className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">IDEMIA Face Auth</h3>
                      <p className="text-sm text-muted-foreground">Reconnaissance faciale</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge className="mr-2 bg-green-100 text-green-800">Active</Badge>
                    <Switch checked={true} />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Scan className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-medium">Document Scanner</h3>
                      <p className="text-sm text-muted-foreground">Vérification de documents</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge className="mr-2 bg-green-100 text-green-800">Active</Badge>
                    <Switch checked={true} />
                  </div>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Performances du système KYC</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Vérification d'identité</span>
                      <span className="text-green-600">96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Reconnaissance faciale</span>
                      <span className="text-green-600">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Scanning de documents</span>
                      <span className="text-amber-600">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Validation automatique</span>
                      <span className="text-green-600">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  
                  <Alert variant="default" className="bg-blue-50 border border-blue-200 mt-2">
                    <AlertTitle className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Détail d'analyse
                    </AlertTitle>
                    <AlertDescription>
                      Les erreurs de scanning de documents sont principalement dues à la qualité des photos prises par les clients.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Type de pièce</TableHead>
                    <TableHead>Date de soumission</TableHead>
                    <TableHead>Score KYC</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Amadou Diallo</TableCell>
                    <TableCell>Carte d'identité</TableCell>
                    <TableCell>09/04/2025 10:25</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2 w-24 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <span>65%</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-amber-100 text-amber-800">Vérification manuelle requise</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2">Vérifier</Button>
                      <Button variant="default" size="sm">Valider</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Fatou Ndiaye</TableCell>
                    <TableCell>Passeport</TableCell>
                    <TableCell>09/04/2025 09:12</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2 w-24 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <span>35%</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-red-100 text-red-800">Document non reconnu</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2">Vérifier</Button>
                      <Button variant="default" size="sm">Valider</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Type de vérification</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score KYC</TableHead>
                    <TableHead>Résultat</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Sophie Mensah</TableCell>
                    <TableCell>Carte d'identité + Face</TableCell>
                    <TableCell>08/04/2025 15:45</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2 w-24 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                        <span>96%</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-green-100 text-green-800">Validé automatiquement</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Voir détails</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Paul Koffi</TableCell>
                    <TableCell>Carte d'identité + Face</TableCell>
                    <TableCell>08/04/2025 14:22</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2 w-24 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '89%' }}></div>
                        </div>
                        <span>89%</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-green-100 text-green-800">Validé automatiquement</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Voir détails</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Configuration de l'API KYC</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">SHIFT Africa API Key</p>
                      <p className="text-sm text-muted-foreground">••••••••••••••••</p>
                    </div>
                    <div>
                      <p className="font-medium">IDEMIA Face Auth API Key</p>
                      <p className="text-sm text-muted-foreground">••••••••••••••••</p>
                    </div>
                    <div>
                      <p className="font-medium">Endpoint URL</p>
                      <p className="text-sm text-muted-foreground">https://api.shift-africa.com/verify</p>
                    </div>
                    <div>
                      <p className="font-medium">Webhook URL</p>
                      <p className="text-sm text-muted-foreground">https://webhook.sfd-app.com/kyc-callback</p>
                    </div>
                  </div>
                  <Button size="sm" className="mt-4">Modifier les paramètres</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Seuils de validation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Score minimum pour validation automatique</p>
                      <p className="text-sm text-muted-foreground">85%</p>
                    </div>
                    <div>
                      <p className="font-medium">Score minimum pour vérification manuelle</p>
                      <p className="text-sm text-muted-foreground">60%</p>
                    </div>
                  </div>
                  <Button size="sm">Modifier les seuils</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings2 className="h-5 w-5 mr-2" />
                    Types de vérifications actifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id="verification-id" checked={true} />
                        <label htmlFor="verification-id">Vérification de pièce d'identité</label>
                      </div>
                      <Badge>Obligatoire</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id="verification-face" checked={true} />
                        <label htmlFor="verification-face">Reconnaissance faciale</label>
                      </div>
                      <Badge>Obligatoire</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id="verification-address" checked={true} />
                        <label htmlFor="verification-address">Justificatif de domicile</label>
                      </div>
                      <Badge variant="outline">Optionnel</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id="verification-fingerprint" checked={false} />
                        <label htmlFor="verification-fingerprint">Empreinte digitale</label>
                      </div>
                      <Badge variant="outline">Optionnel</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default KycAutomationSystem;

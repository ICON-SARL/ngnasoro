
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Gift, Award, Share2 } from 'lucide-react';

export const ClientReferralSystem = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Share2 className="mr-2 h-6 w-6 text-primary" />
          Système de Parrainage & Récompenses
        </CardTitle>
        <CardDescription>
          Gérez les parrainages clients et le programme de fidélité
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="referrals">
          <TabsList className="mb-4">
            <TabsTrigger value="referrals">Parrainages</TabsTrigger>
            <TabsTrigger value="rewards">Programme de Fidélité</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>
          
          <TabsContent value="referrals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Total des parrainages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">128</div>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Bonus distribués</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">320,000 FCFA</div>
                  <p className="text-xs text-muted-foreground">Ce trimestre</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Top Parrain</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">Aissata Diallo</div>
                  <p className="text-xs text-muted-foreground">12 nouveaux clients</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parrain</TableHead>
                    <TableHead>Filleul</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Ibrahim Touré</TableCell>
                    <TableCell>Marie Koné</TableCell>
                    <TableCell>15/03/2025</TableCell>
                    <TableCell>5,000 FCFA</TableCell>
                    <TableCell><Badge className="bg-green-100 text-green-800">Validé</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Détails</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Aminata Sylla</TableCell>
                    <TableCell>Jean Kouassi</TableCell>
                    <TableCell>12/03/2025</TableCell>
                    <TableCell>5,000 FCFA</TableCell>
                    <TableCell><Badge className="bg-amber-100 text-amber-800">En attente</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Détails</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="rewards" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Total des points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">245,350</div>
                  <p className="text-xs text-muted-foreground">Tous clients confondus</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Points échangés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">48,200</div>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Récompenses distribuées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">35</div>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Récompenses disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4 flex flex-col items-center">
                    <Gift className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Réduction sur prêt</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1">0.5% de réduction sur les intérêts</p>
                    <Badge className="mt-2">5,000 points</Badge>
                    <Button size="sm" className="w-full mt-4">Configurer</Button>
                  </div>
                  
                  <div className="border rounded-md p-4 flex flex-col items-center">
                    <Award className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Frais de dossier offerts</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1">Sur le prochain prêt</p>
                    <Badge className="mt-2">10,000 points</Badge>
                    <Button size="sm" className="w-full mt-4">Configurer</Button>
                  </div>
                  
                  <div className="border rounded-md p-4 flex flex-col items-center">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Statut Premium</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1">Pour 3 mois</p>
                    <Badge className="mt-2">15,000 points</Badge>
                    <Button size="sm" className="w-full mt-4">Configurer</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Configuration du parrainage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Bonus par parrainage</p>
                      <p className="text-sm text-muted-foreground">5,000 FCFA</p>
                    </div>
                    <div>
                      <p className="font-medium">Délai de validation</p>
                      <p className="text-sm text-muted-foreground">30 jours</p>
                    </div>
                    <div>
                      <p className="font-medium">Max. parrainages / mois</p>
                      <p className="text-sm text-muted-foreground">5 clients</p>
                    </div>
                    <div>
                      <p className="font-medium">Code de parrainage</p>
                      <p className="text-sm text-muted-foreground">Automatique</p>
                    </div>
                  </div>
                  <Button size="sm">Modifier les paramètres</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Configuration du programme de fidélité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Points par 10,000 FCFA de prêt</p>
                      <p className="text-sm text-muted-foreground">100 points</p>
                    </div>
                    <div>
                      <p className="font-medium">Points par remboursement à temps</p>
                      <p className="text-sm text-muted-foreground">50 points</p>
                    </div>
                    <div>
                      <p className="font-medium">Durée de validité des points</p>
                      <p className="text-sm text-muted-foreground">12 mois</p>
                    </div>
                    <div>
                      <p className="font-medium">Niveau minimum pour récompenses</p>
                      <p className="text-sm text-muted-foreground">1,000 points</p>
                    </div>
                  </div>
                  <Button size="sm">Modifier les paramètres</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ClientReferralSystem;

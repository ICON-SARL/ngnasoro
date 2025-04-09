
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Calendar, 
  User, 
  Users, 
  QrCode,
  ClipboardCheck, 
  MapPin 
} from 'lucide-react';

export const StaffManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-6 w-6 text-primary" />
          Gestion du Personnel
        </CardTitle>
        <CardDescription>
          Gérez les horaires, la présence et les performances de vos employés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="schedule">
          <TabsList className="mb-4">
            <TabsTrigger value="schedule">Horaires</TabsTrigger>
            <TabsTrigger value="attendance">Présence</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Aujourd'hui
                </Button>
                <Button variant="ghost" size="sm">Cette semaine</Button>
                <Button variant="ghost" size="sm">Ce mois</Button>
              </div>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Créer un planning
              </Button>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Agent</TableHead>
                    <TableHead>Lundi</TableHead>
                    <TableHead>Mardi</TableHead>
                    <TableHead>Mercredi</TableHead>
                    <TableHead>Jeudi</TableHead>
                    <TableHead>Vendredi</TableHead>
                    <TableHead>Samedi</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 p-1 rounded-full">
                          <User className="h-4 w-4 text-blue-700" />
                        </div>
                        <span>Konan Kouadio</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">08:00-16:30</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">08:00-16:30</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">08:00-16:30</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-800">12:00-20:00</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-800">12:00-20:00</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Repos</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Modifier</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 p-1 rounded-full">
                          <User className="h-4 w-4 text-blue-700" />
                        </div>
                        <span>Bintou Traoré</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-800">12:00-20:00</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-800">12:00-20:00</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Repos</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">08:00-16:30</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">08:00-16:30</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">08:00-16:30</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Modifier</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Présents aujourd'hui</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15/18</div>
                  <p className="text-xs text-muted-foreground">83% de présence</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Arrivées en retard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Temps moyen: 15 min</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Absences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <div className="flex items-center text-xs">
                    <span className="text-red-600 mr-3">1 non justifiée</span>
                    <span className="text-amber-600">2 justifiées</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Arrivée</TableHead>
                    <TableHead>Départ</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Konan Kouadio</TableCell>
                    <TableCell>Caissier</TableCell>
                    <TableCell>
                      <div className="flex items-center text-green-600">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>07:55</span>
                      </div>
                    </TableCell>
                    <TableCell>--:--</TableCell>
                    <TableCell><Badge className="bg-green-100 text-green-800">Présent</Badge></TableCell>
                    <TableCell>Abidjan Centre</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Détails</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bintou Traoré</TableCell>
                    <TableCell>Conseillère</TableCell>
                    <TableCell>
                      <div className="flex items-center text-amber-600">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>12:15</span>
                      </div>
                    </TableCell>
                    <TableCell>--:--</TableCell>
                    <TableCell><Badge className="bg-amber-100 text-amber-800">Retard (15min)</Badge></TableCell>
                    <TableCell>Abidjan Nord</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Détails</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Seydou Koné</TableCell>
                    <TableCell>Agent crédit</TableCell>
                    <TableCell>
                      <div className="flex items-center text-red-600">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>--:--</span>
                      </div>
                    </TableCell>
                    <TableCell>--:--</TableCell>
                    <TableCell><Badge className="bg-red-100 text-red-800">Absent</Badge></TableCell>
                    <TableCell>Abidjan Centre</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Détails</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-center py-4">
              <Card className="w-full max-w-md p-6">
                <div className="flex justify-center mb-4">
                  <QrCode className="h-32 w-32 text-primary" />
                </div>
                <h3 className="text-center text-lg font-semibold mb-2">Code QR de pointage</h3>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Les agents doivent scanner ce code avec l'application mobile pour enregistrer leur présence.
                </p>
                <div className="flex justify-center">
                  <Button className="mr-2">
                    Télécharger QR
                  </Button>
                  <Button variant="outline">
                    Actualiser
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Crédits traités</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">128</div>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Clients enregistrés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">Ce mois</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68%</div>
                  <p className="text-xs text-muted-foreground">Demandes approuvées</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Clients traités</TableHead>
                    <TableHead>Taux de conversion</TableHead>
                    <TableHead>Satisfaction client</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Konan Kouadio</TableCell>
                    <TableCell>Caissier</TableCell>
                    <TableCell>245</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2 w-24 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span>92%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2 w-24 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                        <span>95%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Détails</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bintou Traoré</TableCell>
                    <TableCell>Conseillère</TableCell>
                    <TableCell>156</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2 w-24 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                        <span>78%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2 w-24 bg-gray-200 rounded-full mr-2">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '88%' }}></div>
                        </div>
                        <span>88%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Détails</Button>
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
                  <CardTitle className="text-md flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Configuration des horaires
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Horaires par défaut</p>
                      <p className="text-sm text-muted-foreground">08:00 - 16:30</p>
                    </div>
                    <div>
                      <p className="font-medium">Pause déjeuner</p>
                      <p className="text-sm text-muted-foreground">12:00 - 13:00 (1h)</p>
                    </div>
                    <div>
                      <p className="font-medium">Tolérance retard</p>
                      <p className="text-sm text-muted-foreground">15 minutes</p>
                    </div>
                    <div>
                      <p className="font-medium">Jours ouvrables</p>
                      <p className="text-sm text-muted-foreground">Lundi à Samedi</p>
                    </div>
                  </div>
                  <Button size="sm">Modifier les paramètres</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-md flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Configuration des agences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">Abidjan Centre</p>
                        <p className="text-xs text-muted-foreground">8 agents</p>
                      </div>
                      <Button variant="ghost" size="sm">Configurer</Button>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">Abidjan Nord</p>
                        <p className="text-xs text-muted-foreground">5 agents</p>
                      </div>
                      <Button variant="ghost" size="sm">Configurer</Button>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">Bouaké</p>
                        <p className="text-xs text-muted-foreground">6 agents</p>
                      </div>
                      <Button variant="ghost" size="sm">Configurer</Button>
                    </div>
                  </div>
                  <Button size="sm" className="mt-4">Ajouter une agence</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-md flex items-center">
                    <ClipboardCheck className="h-5 w-5 mr-2" />
                    Paramètres de pointage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id="qr-attendance" checked={true} />
                        <label htmlFor="qr-attendance">Pointage par QR Code</label>
                      </div>
                      <Badge>Activé</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id="geo-attendance" checked={true} />
                        <label htmlFor="geo-attendance">Vérification de localisation</label>
                      </div>
                      <Badge>Activé</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id="facial-attendance" checked={false} />
                        <label htmlFor="facial-attendance">Vérification faciale</label>
                      </div>
                      <Badge variant="outline">Désactivé</Badge>
                    </div>
                    
                    <div className="mt-4">
                      <p className="font-medium">Rayon géographique autorisé</p>
                      <p className="text-sm text-muted-foreground">100 mètres</p>
                    </div>
                  </div>
                  <Button size="sm" className="mt-4">Modifier les paramètres</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StaffManagement;

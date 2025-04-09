
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  BanknoteIcon, 
  AlertTriangleIcon, 
  BarChart3Icon, 
  PieChartIcon
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const SubventionManagement = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BanknoteIcon className="mr-2 h-6 w-6 text-primary" />
            Module de Subventions
          </CardTitle>
          <CardDescription>
            Suivi des fonds alloués aux SFDs (prêts remboursables ou subventions directes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="allocations">Allocations</TabsTrigger>
              <TabsTrigger value="alerts">Alertes</TabsTrigger>
              <TabsTrigger value="reports">Rapports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Alloué</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2,500,000,000 FCFA</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      45 SFDs bénéficiaires
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Utilisé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,750,000,000 FCFA</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      70% du total alloué
                    </p>
                    <Progress value={70} className="h-2 mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Demandes en attente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Montant total: 350,000,000 FCFA
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Alert variant="default" className="bg-blue-50 border border-blue-200 mb-4">
                <BarChart3Icon className="h-4 w-4" />
                <AlertTitle>Performance des Subventions</AlertTitle>
                <AlertDescription>
                  85% des subventions sont utilisées conformément aux objectifs fixés. 
                  3 SFDs nécessitent un suivi additionnel.
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Conforme: 38 SFDs
                </Badge>
                <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                  Suivi requis: 4 SFDs
                </Badge>
                <Badge className="bg-red-100 text-red-800 border-red-300">
                  Non conforme: 3 SFDs
                </Badge>
              </div>
            </TabsContent>
            
            <TabsContent value="allocations">
              <div className="text-center py-12 text-muted-foreground">
                Tableau des allocations par région et par SFD
              </div>
            </TabsContent>
            
            <TabsContent value="alerts">
              <Alert variant="destructive" className="mb-4">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertTitle>Alerte de détournement potentiel</AlertTitle>
                <AlertDescription>
                  SFD "Crédit Urbain" - Utilisation non conforme de 15,000,000 FCFA pour des 
                  dépenses administratives non autorisées.
                </AlertDescription>
              </Alert>
              
              <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200">
                <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
                <AlertTitle>Alerte de suivi</AlertTitle>
                <AlertDescription>
                  SFD "MicroFinance Nord" - Retard dans l'allocation de 45,000,000 FCFA 
                  destinés aux prêts agricoles.
                </AlertDescription>
              </Alert>
              
              <div className="text-center py-6 text-muted-foreground">
                Le système surveille en permanence l'utilisation des fonds 
                et génère des alertes basées sur des modèles statistiques.
              </div>
            </TabsContent>
            
            <TabsContent value="reports">
              <div className="text-center py-12 text-muted-foreground">
                Graphiques et rapports d'impact des subventions par secteur
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

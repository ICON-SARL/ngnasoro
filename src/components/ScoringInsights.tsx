
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Slider 
} from '@/components/ui/slider';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Settings, 
  User,
  BarChart
} from 'lucide-react';

export const ScoringInsights = () => {
  const [scoringThreshold, setScoringThreshold] = useState<number[]>([65]);
  
  const scoreFactors = [
    {
      name: "Historique de remboursement",
      weight: 40,
      description: "Analyse des paiements antérieurs à travers toutes les SFDs"
    },
    {
      name: "Ratio dette/revenu",
      weight: 25,
      description: "Calculé à partir des transactions SMS bancaires et Orange Money"
    },
    {
      name: "Stabilité des revenus",
      weight: 15,
      description: "Régularité des dépôts et sources de revenus"
    },
    {
      name: "Comportement cross-SFD",
      weight: 10,
      description: "Cohérence des informations entre institutions"
    },
    {
      name: "Ancienneté du client",
      weight: 10,
      description: "Durée des relations avec les SFDs"
    }
  ];

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-[#0D6A51]" />
            Modèle de scoring prédictif
          </CardTitle>
          <CardDescription>
            Algorithmes d'analyse du risque basés sur l'historique multi-SFD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-4">Composantes du score (pondération)</h3>
            <div className="space-y-4">
              {scoreFactors.map((factor) => (
                <div key={factor.name} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{factor.name}</span>
                    <span className="text-sm font-medium">{factor.weight}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <div 
                      className="bg-[#0D6A51] h-3 rounded-full" 
                      style={{ width: `${factor.weight}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="text-sm font-medium mb-2">Seuil d'approbation automatique</h3>
            <div className="flex items-center mt-6 mb-2">
              <span className="text-xs text-red-600 w-10">Rejet</span>
              <Slider
                value={scoringThreshold}
                onValueChange={setScoringThreshold}
                max={100}
                step={1}
                className="flex-1 mx-4"
              />
              <span className="text-xs text-green-600 w-10">Approbation</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-medium">{scoringThreshold[0]}/100</span>
            </div>
            <div className="flex justify-between mt-4">
              <div>
                <span className="text-xs text-muted-foreground">Auto-rejet &lt; 40</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Revue manuelle 40-{scoringThreshold[0]}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Auto-approbation &gt; {scoringThreshold[0]}</span>
              </div>
            </div>
            <div className="mt-4 text-right">
              <Button size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Enregistrer le seuil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="timeAnalysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeAnalysis">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analyse temporelle
          </TabsTrigger>
          <TabsTrigger value="clientSegments">
            <PieChart className="h-4 w-4 mr-2" />
            Segments clients
          </TabsTrigger>
          <TabsTrigger value="modelAccuracy">
            <BarChart className="h-4 w-4 mr-2" />
            Précision du modèle
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeAnalysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse des séries temporelles</CardTitle>
              <CardDescription>
                Historique de remboursement et prédiction de défaut de paiement
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-16 w-16 mx-auto mb-4" />
                <p>Visualisation de l'analyse temporelle des remboursements</p>
                <p className="text-xs mt-2">Utilisation d'algorithmes ARIMA pour prédire les comportements de paiement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clientSegments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segmentation des clients</CardTitle>
              <CardDescription>
                Répartition des profils clients en fonction de leur comportement
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <PieChart className="h-16 w-16 mx-auto mb-4" />
                <p>Visualisation de la segmentation clients</p>
                <p className="text-xs mt-2">Analyse en clusters basée sur K-means</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="modelAccuracy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Précision du modèle</CardTitle>
              <CardDescription>
                Métriques de performance du modèle prédictif
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart className="h-16 w-16 mx-auto mb-4" />
                <p>Visualisation de la matrice de confusion</p>
                <p className="text-xs mt-2">AUC: 0.86, Précision: 0.81, Rappel: 0.78</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

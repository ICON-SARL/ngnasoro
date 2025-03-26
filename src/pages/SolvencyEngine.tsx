
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  LineChart, 
  BarChart3, 
  FileCog, 
  UserCheck, 
  AlertTriangle, 
  Shield, 
  Clock
} from 'lucide-react';
import { ScoringInsights } from '@/components/ScoringInsights';
import { CreditDecisionFlow } from '@/components/CreditDecisionFlow';
import { DataPipelineStatus } from '@/components/DataPipelineStatus';

const SolvencyEngine = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
              alt="NGNA SÔRÔ! Logo" 
              className="h-8"
            />
            <div className="ml-2">
              <h1 className="text-lg font-semibold flex items-center">
                <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
                <Badge className="ml-2 bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-xs">Solvabilité</Badge>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/multi-sfd')}>
              Retour au Dashboard
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Moteur de Solvabilité Inter-SFD</h2>
          <p className="text-muted-foreground">
            Analyse des données client multi-institutions et évaluation des risques
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Database className="h-4 w-4 mr-2 text-[#0D6A51]" />
                Sources de données
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-sm text-muted-foreground">SFDs connectés au pipeline</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <UserCheck className="h-4 w-4 mr-2 text-[#0D6A51]" />
                Score moyen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">72/100</div>
              <p className="text-sm text-muted-foreground">Basé sur 2,450 profils</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-[#0D6A51]" />
                Alertes de fraude
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <div className="flex items-center">
                <p className="text-sm text-muted-foreground mr-2">Détectées ce mois</p>
                <Badge variant="destructive">Urgent</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">
              <LineChart className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="pipeline">
              <Database className="h-4 w-4 mr-2" />
              Pipeline de données
            </TabsTrigger>
            <TabsTrigger value="scoring">
              <BarChart3 className="h-4 w-4 mr-2" />
              Modèle de scoring
            </TabsTrigger>
            <TabsTrigger value="decisions">
              <FileCog className="h-4 w-4 mr-2" />
              Workflow de décision
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribution des scores</CardTitle>
                  <CardDescription>
                    Répartition des clients par score de crédit
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                    <p>Graphique de distribution des scores</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tendances temporelles</CardTitle>
                  <CardDescription>
                    Évolution des scores dans le temps
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <LineChart className="h-16 w-16 mx-auto mb-4" />
                    <p>Graphique d'évolution des scores</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="pipeline">
            <DataPipelineStatus />
          </TabsContent>
          
          <TabsContent value="scoring">
            <ScoringInsights />
          </TabsContent>
          
          <TabsContent value="decisions">
            <CreditDecisionFlow />
          </TabsContent>
        </Tabs>
        
        <Card className="bg-[#0D6A51]/5 border-[#0D6A51]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center text-[#0D6A51]">
              <Shield className="h-4 w-4 mr-2" />
              Sécurité et Conformité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Toutes les données manipulées par le moteur de solvabilité sont cryptées et stockées de manière sécurisée.
              Un audit trail complet est maintenu sur Hyperledger Fabric pour garantir l'intégrité des décisions.
            </p>
            <div className="mt-4 flex gap-2">
              <Badge variant="outline" className="border-[#0D6A51]/30 text-[#0D6A51]">
                <Clock className="h-3 w-3 mr-1" />
                Dernière vérification: 25/03/2023
              </Badge>
              <Badge variant="outline" className="border-[#0D6A51]/30 text-[#0D6A51]">ISO 27001</Badge>
              <Badge variant="outline" className="border-[#0D6A51]/30 text-[#0D6A51]">RGPD</Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SolvencyEngine;

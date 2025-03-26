
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Cloud, 
  GitBranch, 
  Activity, 
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  UploadCloud,
  Database,
  Link as LinkIcon
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const InfrastructureMonitoring = () => {
  const [activeRegion, setActiveRegion] = useState('af-west-1');
  
  const regions = [
    { id: 'af-west-1', name: 'Afrique Ouest', status: 'healthy', nodes: 3 },
    { id: 'af-south-1', name: 'Afrique Sud', status: 'healthy', nodes: 3 },
    { id: 'af-east-1', name: 'Afrique Est', status: 'warning', nodes: 2 },
    { id: 'eu-west-3', name: 'Europe (Paris)', status: 'healthy', nodes: 2 },
  ];
  
  const deployments = [
    { id: 'dep-12345', app: 'API Gateway', status: 'success', time: '22 avril 14:30', commit: 'a1b2c3d' },
    { id: 'dep-12346', app: 'Auth Service', status: 'success', time: '22 avril 12:15', commit: 'e4f5g6h' },
    { id: 'dep-12347', app: 'Transaction API', status: 'failed', time: '21 avril 16:40', commit: 'i7j8k9l' },
    { id: 'dep-12348', app: 'Admin Frontend', status: 'running', time: '22 avril 15:05', commit: 'm1n2o3p' },
  ];
  
  const metrics = [
    { name: 'CPU Utilisation', value: 42, unit: '%', status: 'normal' },
    { name: 'Mémoire', value: 67, unit: '%', status: 'normal' },
    { name: 'Latence API (p95)', value: 235, unit: 'ms', status: 'warning' },
    { name: 'Taux d\'erreur 5xx', value: 0.12, unit: '%', status: 'normal' },
    { name: 'Taux de réussite déploiement', value: 97.8, unit: '%', status: 'normal' },
  ];
  
  const simulateRollback = () => {
    // Simule un rollback automatique
    console.log('Simulation de rollback pour le déploiement: dep-12347');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Infrastructure Kubernetes</h2>
          <p className="text-sm text-muted-foreground">
            Monitoring et gestion des clusters EKS multi-régions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Cloud className="h-4 w-4 mr-1" />
            AWS Console
          </Button>
          <Button>
            <GitBranch className="h-4 w-4 mr-1" />
            ArgoCD
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {regions.map((region) => (
          <div 
            key={region.id}
            className={`border p-4 rounded-lg cursor-pointer transition-colors ${
              activeRegion === region.id 
                ? 'bg-[#0D6A51]/10 border-[#0D6A51]/30' 
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveRegion(region.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{region.name}</div>
                <div className="text-sm text-muted-foreground">{region.id}</div>
              </div>
              <div>
                {region.status === 'healthy' && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Sain
                  </Badge>
                )}
                {region.status === 'warning' && (
                  <Badge className="bg-amber-100 text-amber-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Alerte
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">Nœuds:</span> {region.nodes}
            </div>
          </div>
        ))}
      </div>
      
      <Tabs defaultValue="deployments" className="mb-6">
        <TabsList className="bg-white mb-4">
          <TabsTrigger value="deployments">
            <UploadCloud className="h-4 w-4 mr-1" />
            Déploiements
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Activity className="h-4 w-4 mr-1" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="databases">
            <Database className="h-4 w-4 mr-1" />
            Bases de données
          </TabsTrigger>
          <TabsTrigger value="networking">
            <LinkIcon className="h-4 w-4 mr-1" />
            Réseau
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="deployments" className="border rounded-lg p-4 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Application</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead>Commit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((deployment) => (
                <TableRow key={deployment.id}>
                  <TableCell className="font-medium">{deployment.id}</TableCell>
                  <TableCell>{deployment.app}</TableCell>
                  <TableCell>
                    {deployment.status === 'success' && (
                      <Badge className="bg-green-100 text-green-800">Succès</Badge>
                    )}
                    {deployment.status === 'failed' && (
                      <Badge className="bg-red-100 text-red-800">Échec</Badge>
                    )}
                    {deployment.status === 'running' && (
                      <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
                    )}
                  </TableCell>
                  <TableCell>{deployment.time}</TableCell>
                  <TableCell>{deployment.commit}</TableCell>
                  <TableCell className="text-right">
                    {deployment.status === 'failed' ? (
                      <Button variant="outline" size="sm" onClick={simulateRollback}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Rollback
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm">
                        <Server className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 p-4 border rounded-lg bg-amber-50 border-amber-200">
            <div className="flex items-start">
              <ShieldCheck className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Rollback Automatique</h3>
                <p className="text-sm text-amber-700">
                  Les déploiements avec plus de 5% d'erreurs 5xx sont automatiquement rollback vers la version précédente.
                  L'événement est journalisé et une alerte est envoyée à l'équipe DevOps.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="monitoring" className="border rounded-lg p-4 bg-white">
          <div className="space-y-6">
            {metrics.map((metric, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className="text-sm font-medium">
                    {metric.value} {metric.unit}
                    {metric.status === 'warning' && (
                      <Badge className="ml-2 bg-amber-100 text-amber-800">Surveillance</Badge>
                    )}
                  </span>
                </div>
                <Progress 
                  value={metric.name.includes('%') ? metric.value : (metric.value / 500) * 100} 
                  className={`h-2 ${
                    metric.status === 'warning' ? 'bg-amber-100' : 'bg-green-100'
                  }`}
                />
              </div>
            ))}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Button variant="outline" className="w-full">
                <Activity className="h-4 w-4 mr-1" />
                ELK Dashboard
              </Button>
              <Button variant="outline" className="w-full">
                <Activity className="h-4 w-4 mr-1" />
                Prometheus
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="databases" className="border rounded-lg p-4 bg-white">
          <div className="text-center py-10">
            <Database className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-2">Module base de données</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Surveillance des clusters de base de données, métriques de performance
              et gestion des sauvegardes
            </p>
            <Button>Configurer</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="networking" className="border rounded-lg p-4 bg-white">
          <div className="text-center py-10">
            <LinkIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-2">Module réseau</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Configuration des ingress, gestion du trafic et policies réseau
            </p>
            <Button>Configurer</Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-[#0D6A51]/5">
          <h3 className="font-medium mb-3">GitOps Workflow (ArgoCD)</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                1
              </div>
              <div className="text-sm">
                <p className="font-medium">Modification du code</p>
                <p className="text-muted-foreground">Commits vers le dépôt Git</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                2
              </div>
              <div className="text-sm">
                <p className="font-medium">Pipeline CI</p>
                <p className="text-muted-foreground">Tests et build des images Docker</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                3
              </div>
              <div className="text-sm">
                <p className="font-medium">ArgoCD détecte le changement</p>
                <p className="text-muted-foreground">Synchro auto avec l'état souhaité</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                4
              </div>
              <div className="text-sm">
                <p className="font-medium">Déploiement ou Rollback</p>
                <p className="text-muted-foreground">Basé sur la health check</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-[#0D6A51]/5">
          <h3 className="font-medium mb-3">Stack de Monitoring</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Elasticsearch:</span>
              <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Logstash:</span>
              <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Kibana:</span>
              <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Prometheus:</span>
              <Badge className="bg-green-100 text-green-800">Opérationnel</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Retention des logs:</span>
              <span className="font-medium">30 jours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureMonitoring;

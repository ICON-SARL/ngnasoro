
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye, CheckCircle2, XCircle, Filter, BellRing } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const FraudAlerts = () => {
  const alerts = [
    {
      id: 'ALT1001',
      timestamp: '2023-04-22 09:15',
      type: 'Versement suspect',
      severity: 'high',
      description: 'Versement supérieur à 500,000 FCFA sans historique client',
      transaction: 'TX12345682',
      status: 'new'
    },
    {
      id: 'ALT1002',
      timestamp: '2023-04-21 17:32',
      type: 'Activité inhabituelle',
      severity: 'medium',
      description: 'Multiples retraits en moins de 24h depuis différentes agences',
      transaction: 'TX12345645',
      status: 'investigating'
    },
    {
      id: 'ALT1003',
      timestamp: '2023-04-21 14:45',
      type: 'Identité suspecte',
      severity: 'medium',
      description: 'Document d\'identité potentiellement falsifié',
      transaction: 'TX12345612',
      status: 'resolved'
    },
    {
      id: 'ALT1004',
      timestamp: '2023-04-21 11:23',
      type: 'Schéma de transactions',
      severity: 'high',
      description: 'Pattern de transactions similaire à des cas de fraude connus',
      transaction: 'TX12345590',
      status: 'new'
    },
    {
      id: 'ALT1005',
      timestamp: '2023-04-20 16:15',
      type: 'Emprunt suspect',
      severity: 'low',
      description: 'Demande de prêt avec informations incohérentes',
      transaction: 'LN87654321',
      status: 'resolved'
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Système d'Alertes Frauduleuses</h2>
          <p className="text-sm text-muted-foreground">
            Détection par Machine Learning et analyse comportementale
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filtres
          </Button>
          <Button>
            <BellRing className="h-4 w-4 mr-1" />
            Configurer Alertes
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 mr-3">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Alertes Actives</h3>
                <p className="text-2xl font-bold">7</p>
              </div>
            </div>
            <Badge className="bg-red-100 text-red-800">+2 aujourd'hui</Badge>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mr-3">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">En investigation</h3>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-800">En cours</Badge>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 mr-3">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Résolues (30j)</h3>
                <p className="text-2xl font-bold">42</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">95% efficacité</Badge>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Alerte</TableHead>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sévérité</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id} className={alert.severity === 'high' ? 'bg-red-50' : ''}>
                <TableCell className="font-medium">{alert.id}</TableCell>
                <TableCell>{alert.timestamp}</TableCell>
                <TableCell>{alert.type}</TableCell>
                <TableCell>
                  {alert.severity === 'high' && (
                    <Badge className="bg-red-100 text-red-800">Élevée</Badge>
                  )}
                  {alert.severity === 'medium' && (
                    <Badge className="bg-amber-100 text-amber-800">Moyenne</Badge>
                  )}
                  {alert.severity === 'low' && (
                    <Badge className="bg-blue-100 text-blue-800">Faible</Badge>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">{alert.description}</TableCell>
                <TableCell>
                  {alert.status === 'new' && (
                    <Badge variant="outline" className="bg-red-50 text-red-600">Nouvelle</Badge>
                  )}
                  {alert.status === 'investigating' && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600">En investigation</Badge>
                  )}
                  {alert.status === 'resolved' && (
                    <Badge variant="outline" className="bg-green-50 text-green-600">Résolue</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Examiner
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">Détection par Machine Learning</h3>
            <p className="text-sm text-amber-700 mt-1">
              Le système utilise des algorithmes de Machine Learning pour détecter les schémas suspects 
              et les comportements anormaux. Les modèles sont continuellement formés avec de nouvelles 
              données pour améliorer la précision de détection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

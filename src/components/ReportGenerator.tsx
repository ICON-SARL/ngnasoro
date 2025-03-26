
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, BarChart4, PieChart, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ReportGenerator = () => {
  const reportTemplates = [
    {
      id: 1,
      name: 'Rapport Mensuel d\'Activité',
      description: 'Résumé mensuel des opérations financières et des indicateurs de performance.',
      format: 'PDF/Excel',
      frequency: 'Mensuel',
      lastGenerated: '01/04/2023',
    },
    {
      id: 2,
      name: 'Rapport de Conformité Réglementaire',
      description: 'Analyse de la conformité aux exigences réglementaires et aux normes du secteur.',
      format: 'PDF',
      frequency: 'Trimestriel',
      lastGenerated: '31/03/2023',
    },
    {
      id: 3,
      name: 'Analyse des Risques de Portefeuille',
      description: 'Évaluation des risques associés au portefeuille de prêts et recommandations.',
      format: 'PDF/Excel',
      frequency: 'Mensuel',
      lastGenerated: '01/04/2023',
    },
    {
      id: 4,
      name: 'Rapport de Performance des Agences',
      description: 'Comparaison des performances entre les différentes agences SFD.',
      format: 'PDF/Excel',
      frequency: 'Mensuel',
      lastGenerated: '01/04/2023',
    },
  ];

  const scheduledReports = [
    {
      id: 101,
      name: 'Rapport Mensuel d\'Activité - Avril 2023',
      format: 'PDF',
      status: 'scheduled',
      scheduledDate: '01/05/2023',
    },
    {
      id: 102,
      name: 'Analyse des Risques de Portefeuille - Avril 2023',
      format: 'Excel',
      status: 'processing',
      scheduledDate: '01/05/2023',
    },
    {
      id: 103,
      name: 'Rapport de Performance des Agences - Avril 2023',
      format: 'PDF',
      status: 'completed',
      scheduledDate: '01/05/2023',
      completedDate: '01/05/2023',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Générateur de Rapports</h2>
          <p className="text-sm text-muted-foreground">
            Génération automatisée de rapports au format PDF et Excel
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-1" />
            Planifier
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-1" />
            Nouveau Rapport
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Modèles de Rapports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant="outline">
                        <FileSpreadsheet className="h-3 w-3 mr-1" />
                        {template.format}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {template.frequency}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Générer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Rapports récents & programmés</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Nom du rapport</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Format</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scheduledReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-4 py-3 text-sm">{report.name}</td>
                    <td className="px-4 py-3 text-sm">{report.format}</td>
                    <td className="px-4 py-3 text-sm">
                      {report.status === 'scheduled' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-600">Programmé</Badge>
                      )}
                      {report.status === 'processing' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600">En cours</Badge>
                      )}
                      {report.status === 'completed' && (
                        <Badge variant="outline" className="bg-green-50 text-green-600">Terminé</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {report.status === 'completed' ? report.completedDate : report.scheduledDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {report.status === 'completed' && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                      )}
                      {report.status === 'scheduled' && (
                        <Button variant="ghost" size="sm">
                          Modifier
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Visualisation des données</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Performance des prêts par région</h4>
                <Button variant="outline" size="sm">
                  <PieChart className="h-4 w-4 mr-1" />
                  Exporter
                </Button>
              </div>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded border">
                <p className="text-muted-foreground">Graphique de performance des prêts</p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Tendances des transactions (30 jours)</h4>
                <Button variant="outline" size="sm">
                  <BarChart4 className="h-4 w-4 mr-1" />
                  Exporter
                </Button>
              </div>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded border">
                <p className="text-muted-foreground">Graphique des tendances</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

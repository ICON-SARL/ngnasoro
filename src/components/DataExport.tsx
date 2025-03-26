
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Clock, Database, FileCog, DownloadCloud, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DataExport = () => {
  const exportHistory = [
    {
      id: 'EXP001',
      name: 'Transactions - Mars 2023',
      format: 'CSV',
      records: '1,245',
      date: '01/04/2023',
      size: '2.4 MB',
      status: 'completed'
    },
    {
      id: 'EXP002',
      name: 'Clients - Q1 2023',
      format: 'XML',
      records: '892',
      date: '01/04/2023',
      size: '1.8 MB',
      status: 'completed'
    },
    {
      id: 'EXP003',
      name: 'Prêts - Mars 2023',
      format: 'CSV',
      records: '356',
      date: '01/04/2023',
      size: '0.9 MB',
      status: 'completed'
    },
    {
      id: 'EXP004',
      name: 'Transactions - Avril 2023',
      format: 'CSV',
      records: '420',
      date: '22/04/2023',
      size: '0.7 MB',
      status: 'processing'
    },
  ];

  const exportTemplates = [
    {
      id: 'TPL001',
      name: 'Transactions mensuelles',
      description: 'Export mensuel des transactions financières avec détails complets',
      format: 'CSV',
      frequency: 'Mensuel',
      lastRun: '01/04/2023',
      nextRun: '01/05/2023',
    },
    {
      id: 'TPL002',
      name: 'Base de données clients',
      description: 'Export complet de la base clients avec informations personnelles',
      format: 'XML',
      frequency: 'Trimestriel',
      lastRun: '01/04/2023',
      nextRun: '01/07/2023',
    },
    {
      id: 'TPL003',
      name: 'État des prêts',
      description: 'Export avec l\'état de tous les prêts actifs et leur situation',
      format: 'CSV',
      frequency: 'Mensuel',
      lastRun: '01/04/2023',
      nextRun: '01/05/2023',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Export des Données</h2>
          <p className="text-sm text-muted-foreground">
            Export vers les systèmes legacy (CSV/XML)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-1" />
            Planifier
          </Button>
          <Button>
            <FileDown className="h-4 w-4 mr-1" />
            Nouvel Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="export" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="export">
            <FileDown className="h-4 w-4 mr-2" />
            Exports
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileCog className="h-4 w-4 mr-2" />
            Modèles
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Database className="h-4 w-4 mr-2" />
            Paramètres
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="export" className="border rounded-lg bg-white">
          <table className="min-w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Format</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Enregistrements</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Taille</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {exportHistory.map((export_) => (
                <tr key={export_.id}>
                  <td className="px-4 py-3 text-sm font-medium">{export_.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant="outline">
                      {export_.format}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{export_.records}</td>
                  <td className="px-4 py-3 text-sm">{export_.date}</td>
                  <td className="px-4 py-3 text-sm">{export_.size}</td>
                  <td className="px-4 py-3 text-sm">
                    {export_.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-700">Terminé</Badge>
                    )}
                    {export_.status === 'processing' && (
                      <Badge className="bg-amber-100 text-amber-700">En cours</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {export_.status === 'completed' ? (
                      <Button variant="ghost" size="sm">
                        <DownloadCloud className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        <Clock className="h-4 w-4 mr-1" />
                        En attente
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="space-y-4">
            {exportTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant="outline">
                        {template.format}
                      </Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {template.frequency}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Button size="sm">
                      <FileDown className="h-4 w-4 mr-1" />
                      Exécuter
                    </Button>
                    <div className="text-xs text-muted-foreground mt-2">
                      Dernière exécution: {template.lastRun}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Prochaine exécution: {template.nextRun}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Paramètres d'exportation</h3>
            
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Formats supportés</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="csv" checked readOnly className="rounded" />
                    <label htmlFor="csv">CSV (Comma Separated Values)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="xml" checked readOnly className="rounded" />
                    <label htmlFor="xml">XML (Extensible Markup Language)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="json" checked readOnly className="rounded" />
                    <label htmlFor="json">JSON (JavaScript Object Notation)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="excel" checked readOnly className="rounded" />
                    <label htmlFor="excel">Excel (.xlsx)</label>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Options d'export</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="headers" checked readOnly className="rounded" />
                    <label htmlFor="headers">Inclure les en-têtes de colonnes</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="dates" checked readOnly className="rounded" />
                    <label htmlFor="dates">Format de date ISO 8601</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="encoding" checked readOnly className="rounded" />
                    <label htmlFor="encoding">Encodage UTF-8</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="compress" checked readOnly className="rounded" />
                    <label htmlFor="compress">Compression des fichiers volumineux</label>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Intégration systèmes legacy</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="legacy1" checked readOnly className="rounded" />
                    <label htmlFor="legacy1">Système comptable central</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="legacy2" checked readOnly className="rounded" />
                    <label htmlFor="legacy2">Base de données nationale SFD</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="legacy3" className="rounded" />
                    <label htmlFor="legacy3">Système de reporting BCEAO</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Intégration avec systèmes legacy</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Les exports de données peuvent être automatiquement intégrés dans vos systèmes existants.
          Les formats supportés permettent une compatibilité maximale avec les applications tierces.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-white">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
              <Calendar className="h-5 w-5" />
            </div>
            <h4 className="font-medium">Exports automatisés</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Programmation d'exports réguliers selon vos besoins
            </p>
          </div>
          
          <div className="border rounded-lg p-4 bg-white">
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 mb-2">
              <FileCog className="h-5 w-5" />
            </div>
            <h4 className="font-medium">Formats personnalisables</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Adaptation des formats selon les spécifications requises
            </p>
          </div>
          
          <div className="border rounded-lg p-4 bg-white">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 mb-2">
              <Database className="h-5 w-5" />
            </div>
            <h4 className="font-medium">Historique complet</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Accès à tous les exports antérieurs avec statistiques
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

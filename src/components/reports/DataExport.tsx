import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, ExternalLink, File, FileCode, FileText, Filter, 
  FileSpreadsheet, Table
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DatePicker } from '@/components/ui/date-picker';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFinancialExport } from '@/hooks/useFinancialExport';
import { useReportGeneration } from '@/hooks/useReportGeneration';

export function DataExport() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [fileName, setFileName] = useState('export_donnees');
  const [exportFormat, setExportFormat] = useState('excel');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  const { exportToExcel, exportToPDF } = useFinancialExport();
  const { getReportData } = useReportGeneration();
  
  const handleExport = async () => {
    if (!startDate || !endDate || !fileName) {
      return;
    }
    
    setIsExporting(true);
    setExportProgress(10);
    
    try {
      // Simuler un progrès d'exportation
      const interval = setInterval(() => {
        setExportProgress((prev) => {
          const newProgress = prev + 20;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 500);
      
      // Récupérer les données pour l'export
      const data = await getReportData({
        type: activeTab as any,
        startDate,
        endDate,
        sfdId: undefined
      });
      
      setExportProgress(90);
      
      // Effectuer l'export selon le format sélectionné
      if (exportFormat === 'excel') {
        await exportToExcel(data, { fileName });
      } else if (exportFormat === 'pdf') {
        await exportToPDF(data, { 
          fileName,
          title: `Rapport ${activeTab}`,
          subtitle: `Période: ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
        });
      } else {
        // Format CSV - option à implémenter si nécessaire
      }
      
      setExportProgress(100);
      
      // Réinitialiser l'état après un moment
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      setIsExporting(false);
      setExportProgress(0);
    }
  };
  
  const getDataSizeInfo = () => {
    switch(activeTab) {
      case 'transactions': return '~500 KB';
      case 'loans': return '~350 KB';
      case 'subsidies': return '~150 KB';
      case 'clients': return '~250 KB';
      default: return '~200 KB';
    }
  };

  const getDataCountInfo = () => {
    switch(activeTab) {
      case 'transactions': return 'env. 1200 enregistrements';
      case 'loans': return 'env. 450 enregistrements';
      case 'subsidies': return 'env. 50 enregistrements';
      case 'clients': return 'env. 600 enregistrements';
      default: return 'env. 300 enregistrements';
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export des données</CardTitle>
          <CardDescription>
            Exportez vos données dans différents formats pour analyse externe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="loans">Prêts</TabsTrigger>
              <TabsTrigger value="subsidies">Subventions</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
            </TabsList>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-name">Nom du fichier</Label>
                  <Input 
                    id="file-name" 
                    value={fileName} 
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="export_donnees" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Format d'export</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      type="button" 
                      variant={exportFormat === 'excel' ? 'default' : 'outline'} 
                      onClick={() => setExportFormat('excel')}
                      className="flex-1"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                    <Button 
                      type="button" 
                      variant={exportFormat === 'pdf' ? 'default' : 'outline'} 
                      onClick={() => setExportFormat('pdf')}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button 
                      type="button" 
                      variant={exportFormat === 'csv' ? 'default' : 'outline'} 
                      onClick={() => setExportFormat('csv')}
                      className="flex-1"
                    >
                      <FileCode className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Période de données</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {startDate ? format(startDate, 'dd/MM/yyyy') : 'Date de début'}
                          <Calendar className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <DatePicker
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {endDate ? format(endDate, 'dd/MM/yyyy') : 'Date de fin'}
                          <Calendar className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <DatePicker
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                {isExporting ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression de l'export</span>
                      <span>{exportProgress}%</span>
                    </div>
                    <Progress value={exportProgress} className="h-2" />
                  </div>
                ) : (
                  <Button 
                    onClick={handleExport} 
                    className="w-full mt-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter les données
                  </Button>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <div className="mb-4">
                  <h3 className="font-medium text-lg">Aperçu de l'export</h3>
                  <p className="text-sm text-muted-foreground">
                    Informations sur les données à exporter
                  </p>
                </div>
                
                <TabsContent value="transactions" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Table className="h-10 w-10 text-blue-500 mr-3" />
                      <div>
                        <h4 className="font-medium">Données de transactions</h4>
                        <p className="text-sm text-muted-foreground">
                          Exporter toutes les transactions
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Colonnes incluses:</span>
                        <ul className="mt-1 space-y-1">
                          <li>ID transaction</li>
                          <li>Date</li>
                          <li>Montant</li>
                          <li>Type</li>
                          <li>Status</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-muted-foreground">Taille estimée:</span>
                          <p>{getDataSizeInfo()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nombre de lignes:</span>
                          <p>{getDataCountInfo()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="loans" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <FileText className="h-10 w-10 text-green-500 mr-3" />
                      <div>
                        <h4 className="font-medium">Données de prêts</h4>
                        <p className="text-sm text-muted-foreground">
                          Exporter tous les prêts et leurs statuts
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Colonnes incluses:</span>
                        <ul className="mt-1 space-y-1">
                          <li>ID prêt</li>
                          <li>Client</li>
                          <li>Montant</li>
                          <li>Durée</li>
                          <li>Taux d'intérêt</li>
                          <li>Statut</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-muted-foreground">Taille estimée:</span>
                          <p>{getDataSizeInfo()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nombre de lignes:</span>
                          <p>{getDataCountInfo()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="subsidies" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <FileText className="h-10 w-10 text-amber-500 mr-3" />
                      <div>
                        <h4 className="font-medium">Données de subventions</h4>
                        <p className="text-sm text-muted-foreground">
                          Exporter toutes les subventions reçues
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Colonnes incluses:</span>
                        <ul className="mt-1 space-y-1">
                          <li>ID subvention</li>
                          <li>Date d'allocation</li>
                          <li>Montant</li>
                          <li>Montant utilisé</li>
                          <li>Montant restant</li>
                          <li>Statut</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-muted-foreground">Taille estimée:</span>
                          <p>{getDataSizeInfo()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nombre de lignes:</span>
                          <p>{getDataCountInfo()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="clients" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <FileText className="h-10 w-10 text-purple-500 mr-3" />
                      <div>
                        <h4 className="font-medium">Données clients</h4>
                        <p className="text-sm text-muted-foreground">
                          Exporter toutes les informations clients
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Colonnes incluses:</span>
                        <ul className="mt-1 space-y-1">
                          <li>ID client</li>
                          <li>Nom complet</li>
                          <li>Email</li>
                          <li>Téléphone</li>
                          <li>Adresse</li>
                          <li>Statut</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-muted-foreground">Taille estimée:</span>
                          <p>{getDataSizeInfo()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nombre de lignes:</span>
                          <p>{getDataCountInfo()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

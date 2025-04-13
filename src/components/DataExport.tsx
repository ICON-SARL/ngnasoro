
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileSpreadsheet, Database, DownloadCloud, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export function DataExport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dataType, setDataType] = useState('transactions');
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('month');
  const [isExporting, setIsExporting] = useState(false);
  
  // Selected fields for export
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
    id: true,
    amount: true,
    created_at: true,
    status: true,
    type: true,
    description: true,
    user_id: false,
    sfd_id: true
  });
  
  // Refresh dashboard stats when this component is mounted
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['sfd-dashboard-stats'] });
  }, [queryClient]);
  
  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Export réussi",
        description: `Les données ont été exportées au format ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'exportation",
        description: "Une erreur s'est produite lors de l'exportation des données",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Export des Données
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Exportez vos données dans différents formats pour analyse externe.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Type de Données</Label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type de données" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transactions">Transactions</SelectItem>
                  <SelectItem value="loans">Prêts</SelectItem>
                  <SelectItem value="users">Utilisateurs</SelectItem>
                  <SelectItem value="sfds">SFDs</SelectItem>
                  <SelectItem value="subsidies">Subventions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Format d'Export</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Période</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois-ci</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                  <SelectItem value="all">Toutes les données</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Nom du Fichier</Label>
              <Input placeholder="export_data" />
            </div>
            
            <Button className="w-full mt-4" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>Exportation en cours...</>
              ) : (
                <>
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Exporter les Données
                </>
              )}
            </Button>
          </div>
          
          <div>
            <Label className="mb-2 block">Champs à Exporter</Label>
            <Card className="border rounded-md">
              <CardContent className="p-4 space-y-2">
                {Object.keys(selectedFields).map(field => (
                  <div className="flex items-center space-x-2" key={field}>
                    <Checkbox
                      id={`field-${field}`}
                      checked={selectedFields[field]}
                      onCheckedChange={() => handleFieldToggle(field)}
                    />
                    <Label
                      htmlFor={`field-${field}`}
                      className="cursor-pointer text-sm"
                    >
                      {field}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <div className="mt-4">
              <Card className="border">
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm flex items-center">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export Préconfigurés
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm">Export standard</span>
                    <Button size="sm" variant="ghost" className="h-8 px-2">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm">Export détaillé</span>
                    <Button size="sm" variant="ghost" className="h-8 px-2">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Export pour audit</span>
                    <Button size="sm" variant="ghost" className="h-8 px-2">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ReportsGenerationPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>('monthly');
  const [format, setFormat] = useState<string>('pdf');
  const [period, setPeriod] = useState<string>('current-month');

  const reportTypes = [
    { value: 'monthly', label: 'Rapport Mensuel Global', description: 'Vue d\'ensemble de tous les SFDs' },
    { value: 'sfd', label: 'Rapport par SFD', description: 'Performance d\'un SFD spécifique' },
    { value: 'subsidies', label: 'Rapport Subventions', description: 'Utilisation des subventions' },
    { value: 'risk', label: 'Rapport Risque', description: 'Analyse des prêts à risque' }
  ];

  const handleGenerate = () => {
    toast({
      title: "Génération en cours",
      description: "Votre rapport sera disponible dans quelques instants"
    });
    
    // TODO: Implement actual report generation
    setTimeout(() => {
      toast({
        title: "Rapport prêt",
        description: "Votre rapport est disponible au téléchargement"
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Génération de Rapports</h1>
        <p className="text-muted-foreground">
          Créez des rapports détaillés sur l'activité de l'écosystème
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nouveau Rapport</CardTitle>
            <CardDescription>
              Sélectionnez le type de rapport à générer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Type de Rapport</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Mois en cours</SelectItem>
                  <SelectItem value="last-month">Mois dernier</SelectItem>
                  <SelectItem value="current-quarter">Trimestre en cours</SelectItem>
                  <SelectItem value="last-quarter">Dernier trimestre</SelectItem>
                  <SelectItem value="current-year">Année en cours</SelectItem>
                  <SelectItem value="custom">Période personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Générer le Rapport
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rapports Récents</CardTitle>
            <CardDescription>
              Historique de vos rapports générés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Rapport Mensuel - {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Généré il y a {i + 1} jour{i > 0 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

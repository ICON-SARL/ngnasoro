
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { FileText, BarChart2, Download, FileSpreadsheet, FilePdf } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from "react-day-picker";
import { useReportGeneration, ReportType, ReportFormat } from '@/hooks/useReportGeneration';
import { format, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ReportGenerator() {
  const queryClient = useQueryClient();
  const { isGenerating, generateReport } = useReportGeneration();
  
  const [reportType, setReportType] = useState<ReportType>('transactions');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('pdf');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [sfdId, setSfdId] = useState<string | undefined>(undefined);
  
  // Refresh dashboard stats when this component is mounted
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['sfd-dashboard-stats'] });
  }, [queryClient]);
  
  const handleGenerateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    await generateReport({
      type: reportType,
      startDate: dateRange.from,
      endDate: dateRange.to,
      sfdId,
      format: reportFormat
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Générateur de Rapports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generator" className="space-y-4">
          <TabsList>
            <TabsTrigger value="generator">Générateur</TabsTrigger>
            <TabsTrigger value="templates">Modèles</TabsTrigger>
            <TabsTrigger value="scheduled">Rapports Programmés</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Type de Rapport</label>
                  <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type de rapport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transactions">Transactions</SelectItem>
                      <SelectItem value="loans">Prêts</SelectItem>
                      <SelectItem value="subsidies">Subventions</SelectItem>
                      <SelectItem value="sfds">SFDs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Format</label>
                  <Select value={reportFormat} onValueChange={(value) => setReportFormat(value as ReportFormat)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">SFD (Optionnel)</label>
                  <Select value={sfdId || ""} onValueChange={setSfdId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les SFDs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les SFDs</SelectItem>
                      <SelectItem value="sfd-1">SFD 1</SelectItem>
                      <SelectItem value="sfd-2">SFD 2</SelectItem>
                      <SelectItem value="sfd-3">SFD 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Période</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd/MM/yyyy", { locale: fr })} -{" "}
                              {format(dateRange.to, "dd/MM/yyyy", { locale: fr })}
                            </>
                          ) : (
                            format(dateRange.from, "dd/MM/yyyy", { locale: fr })
                          )
                        ) : (
                          "Sélectionner la période"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button
                  className="w-full mt-6"
                  onClick={handleGenerateReport}
                  disabled={isGenerating || !dateRange?.from || !dateRange?.to}
                >
                  {isGenerating ? (
                    <>Génération en cours...</>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Générer le Rapport
                    </>
                  )}
                </Button>
                
                <div className="flex justify-center space-x-2 mt-2">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setReportFormat('pdf')}>
                    <FilePdf className="h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setReportFormat('excel')}>
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setReportFormat('csv')}>
                    <FileText className="h-4 w-4" />
                    CSV
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-4">
            <p className="text-muted-foreground">Modèles de rapport prédéfinis pour une génération rapide</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart2 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Rapport Mensuel SFD</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Résumé des activités SFD du mois</p>
                  <Button size="sm" className="mt-3 w-full">Générer</Button>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">Transactions Hebdomadaires</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Toutes les transactions de la semaine</p>
                  <Button size="sm" className="mt-3 w-full">Générer</Button>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-amber-600" />
                    <h3 className="font-medium">Subventions Trimestrielles</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">État des subventions du trimestre</p>
                  <Button size="sm" className="mt-3 w-full">Générer</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="scheduled" className="space-y-4">
            <p className="text-muted-foreground">Rapports automatiquement générés selon un calendrier prédéfini</p>
            
            <div className="border rounded-md">
              <div className="grid grid-cols-4 bg-gray-50 p-3 border-b">
                <div className="font-medium">Nom</div>
                <div className="font-medium">Fréquence</div>
                <div className="font-medium">Format</div>
                <div className="font-medium">Actions</div>
              </div>
              
              <div className="p-3 border-b grid grid-cols-4 items-center">
                <div>Rapport Financier</div>
                <div>Mensuel</div>
                <div>PDF + Excel</div>
                <div><Button size="sm" variant="outline">Modifier</Button></div>
              </div>
              
              <div className="p-3 border-b grid grid-cols-4 items-center">
                <div>État des Prêts</div>
                <div>Hebdomadaire</div>
                <div>Excel</div>
                <div><Button size="sm" variant="outline">Modifier</Button></div>
              </div>
              
              <div className="p-3 grid grid-cols-4 items-center">
                <div>Rapport KPI</div>
                <div>Quotidien</div>
                <div>PDF</div>
                <div><Button size="sm" variant="outline">Modifier</Button></div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  FileSpreadsheet,
  Download,
  Calendar,
  BarChart4,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialExport } from '@/hooks/useFinancialExport';
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

export const FinancialReports = () => {
  const [reportType, setReportType] = useState('transactions');
  const [reportPeriod, setReportPeriod] = useState('month');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  const { allTransactions, isLoading } = useRealtimeTransactions();
  const { exportToExcel, exportToPDF, prepareTransactionsForExport, isExporting } = useFinancialExport();
  
  const handleExportToExcel = () => {
    const formattedData = prepareTransactionsForExport(allTransactions);
    const today = format(new Date(), 'dd MMMM yyyy', { locale: fr });
    
    exportToExcel(formattedData, {
      fileName: `Rapport_Financier_${reportType}_${today}`,
      title: `Rapport Financier - ${reportType}`
    });
  };
  
  const handleExportToPDF = () => {
    const formattedData = prepareTransactionsForExport(allTransactions);
    const today = format(new Date(), 'dd MMMM yyyy', { locale: fr });
    
    exportToPDF(formattedData, {
      fileName: `Rapport_Financier_${reportType}_${today}`,
      title: `Rapport Financier - ${reportType}`,
      subtitle: `Période: ${dateRange?.from 
        ? format(dateRange.from, 'dd/MM/yyyy', { locale: fr })
        : ''} - ${dateRange?.to 
        ? format(dateRange.to, 'dd/MM/yyyy', { locale: fr })
        : ''}`
    });
  };

  const getFilteredTransactions = () => {
    if (!dateRange?.from || !dateRange?.to) return allTransactions;
    
    return allTransactions.filter(tx => {
      const txDate = new Date(tx.created_at);
      return txDate >= dateRange.from! && txDate <= dateRange.to!;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const averageAmount = filteredTransactions.length > 0 
    ? totalAmount / filteredTransactions.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-semibold">Génération de Rapports</h2>
          <p className="text-sm text-muted-foreground">
            Analysez et exportez vos données financières
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de rapport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="loans">Prêts</SelectItem>
              <SelectItem value="subsidies">Subventions</SelectItem>
              <SelectItem value="sfds">SFDs</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Sélectionner une période</span>
                  )}
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DateRangePicker
                  date={dateRange}
                  setDate={setDateRange}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleExportToExcel} 
            disabled={isExporting || isLoading}
            className="md:ml-2"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel
          </Button>
          
          <Button 
            onClick={handleExportToPDF} 
            disabled={isExporting || isLoading}
          >
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="charts">Graphiques</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total des transactions
                </CardTitle>
                <CardDescription>
                  Période sélectionnée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredTransactions.length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Volume total
                </CardTitle>
                <CardDescription>
                  Période sélectionnée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalAmount.toLocaleString()} FCFA
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Montant moyen
                </CardTitle>
                <CardDescription>
                  Par transaction
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(averageAmount).toLocaleString()} FCFA
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Répartition par type</CardTitle>
              <CardDescription>
                Distribution des transactions par catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center bg-muted/10 rounded border">
              {isLoading ? (
                <p>Chargement des données...</p>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Graphique de répartition par type (utiliser Recharts)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Transactions</CardTitle>
              <CardDescription>
                Détail des transactions pour la période sélectionnée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">Chargement des transactions...</TableCell>
                    </TableRow>
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.slice(0, 10).map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{tx.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tx.type}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{tx.amount.toLocaleString()} FCFA</TableCell>
                        <TableCell>
                          <Badge variant={tx.status === 'success' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}>
                            {tx.status || 'success'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">Aucune transaction disponible pour la période sélectionnée</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Affichage de {Math.min(10, filteredTransactions.length)} sur {filteredTransactions.length} transactions
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Télécharger tout
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="charts" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5" />
                  Évolution mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-muted/10 rounded border">
                <p className="text-muted-foreground">Graphique d'évolution mensuelle des transactions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart4 className="h-5 w-5" />
                  Répartition par SFD
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-muted/10 rounded border">
                <p className="text-muted-foreground">Graphique de répartition par SFD</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Rapports disponibles</CardTitle>
          <CardDescription>Rapports prédéfinis pour analyse rapide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  Rapport mensuel
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">Synthèse des opérations du mois en cours</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-green-500" />
                  Bilan financier
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">État financier détaillé avec analyses</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-purple-500" />
                  Performance SFDs
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">Analyse comparative des SFDs</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  FileSpreadsheet,
  PieChart, 
  BarChart4, 
  FileDown, 
  Calendar,
  DownloadCloud 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialExport } from '@/hooks/useFinancialExport';
import { useRealtimeTransactions } from '@/hooks/useRealtimeTransactions';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const FinancialReporting = () => {
  const [reportPeriod, setReportPeriod] = useState('month');
  const { allTransactions, isLoading } = useRealtimeTransactions();
  const { exportToExcel, exportToPDF, prepareTransactionsForExport, isExporting } = useFinancialExport();
  const { activeSfdId } = useAuth();
  
  const handleExportToExcel = () => {
    const formattedData = prepareTransactionsForExport(allTransactions);
    const today = format(new Date(), 'dd MMMM yyyy', { locale: fr });
    const period = reportPeriod === 'month' ? 'Mensuel' : reportPeriod === 'quarter' ? 'Trimestriel' : 'Annuel';
    
    exportToExcel(formattedData, {
      fileName: `Rapport_Financier_${period}_${today}`,
      title: `Rapport Financier ${period}`
    });
  };
  
  const handleExportToPDF = () => {
    const formattedData = prepareTransactionsForExport(allTransactions);
    const today = format(new Date(), 'dd MMMM yyyy', { locale: fr });
    const period = reportPeriod === 'month' ? 'Mensuel' : reportPeriod === 'quarter' ? 'Trimestriel' : 'Annuel';
    
    exportToPDF(formattedData, {
      fileName: `Rapport_Financier_${period}_${today}`,
      title: `Rapport Financier ${period}`,
      subtitle: `Généré le ${today}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Reporting Financier</h2>
          <p className="text-sm text-muted-foreground">
            Analysez et exportez vos données financières
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={reportPeriod} 
            onValueChange={setReportPeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Rapport Mensuel</SelectItem>
              <SelectItem value="quarter">Rapport Trimestriel</SelectItem>
              <SelectItem value="year">Rapport Annuel</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExportToExcel} disabled={isExporting || isLoading}>
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel
          </Button>
          <Button onClick={handleExportToPDF} disabled={isExporting || isLoading}>
            <FileText className="h-4 w-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total des transactions
            </CardTitle>
            <CardDescription>
              Période actuelle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allTransactions.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Volume total
            </CardTitle>
            <CardDescription>
              Période actuelle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()} FCFA
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
              {allTransactions.length > 0 
                ? Math.round(allTransactions.reduce((sum, tx) => sum + tx.amount, 0) / allTransactions.length).toLocaleString() 
                : 0} FCFA
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Transactions par type
            </CardTitle>
            <CardDescription>
              Répartition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {Array.from(new Set(allTransactions.map(tx => tx.type))).map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}: {allTransactions.filter(tx => tx.type === type).length}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transactions récentes</CardTitle>
          <CardDescription>
            Les dernières transactions de la période
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
              ) : allTransactions.length > 0 ? (
                allTransactions.slice(0, 10).map((tx) => (
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
                  <TableCell colSpan={5} className="text-center py-4">Aucune transaction disponible</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" size="sm">
            <DownloadCloud className="h-4 w-4 mr-1" />
            Télécharger le rapport complet
          </Button>
        </CardFooter>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Répartition par type
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-muted/20 rounded border">
            <p className="text-muted-foreground">Graphique de répartition par type de transaction</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart4 className="h-5 w-5" />
              Évolution des montants
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-muted/20 rounded border">
            <p className="text-muted-foreground">Graphique d'évolution des montants sur la période</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

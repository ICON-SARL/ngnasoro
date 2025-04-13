
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar, Download, FileDown, FileText, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

interface ReportGeneratorProps {
  onGenerateReport?: (reportData: any) => void;
  className?: string;
}

export function ReportGenerator({ onGenerateReport, className }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState('transactions');
  const [format, setFormat] = useState('excel');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFilterChange = (value: string) => {
    setFilters(current => 
      current.includes(value) 
        ? current.filter(item => item !== value)
        : [...current, value]
    );
  };
  
  const handleGenerateReport = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reportData = {
        type: reportType,
        format,
        dateRange,
        filters
      };
      
      onGenerateReport?.(reportData);
      
      toast({
        title: 'Rapport généré avec succès',
        description: `Votre rapport ${reportType} a été généré au format ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du rapport',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Générateur de rapports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Type de rapport</Label>
          <Select 
            value={reportType} 
            onValueChange={setReportType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type de rapport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="loans">Prêts</SelectItem>
              <SelectItem value="accounts">Comptes SFD</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="subsidies">Subventions</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Format</Label>
          <Select 
            value={format} 
            onValueChange={setFormat}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Période</Label>
          <DateRangePicker
            date={dateRange}
            setDate={setDateRange}
          />
        </div>
        
        <div>
          <Label className="block mb-2">Filtres</Label>
          <div className="space-y-2 border rounded-md p-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filter-sfd" 
                checked={filters.includes('sfd')}
                onCheckedChange={() => handleFilterChange('sfd')}
              />
              <Label htmlFor="filter-sfd">Filtrer par SFD</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filter-status" 
                checked={filters.includes('status')}
                onCheckedChange={() => handleFilterChange('status')}
              />
              <Label htmlFor="filter-status">Filtrer par statut</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filter-amount" 
                checked={filters.includes('amount')}
                onCheckedChange={() => handleFilterChange('amount')}
              />
              <Label htmlFor="filter-amount">Filtrer par montant</Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>Génération en cours...</>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Générer le rapport
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

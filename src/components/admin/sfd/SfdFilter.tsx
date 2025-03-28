
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileDown, Search } from 'lucide-react';

interface SfdFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onExportPdf?: () => void;
  onExportExcel?: () => void;
  onExportCsv?: () => void;
  isExporting?: boolean;
}

export function SfdFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onExportPdf,
  onExportExcel,
  onExportCsv,
  isExporting = false
}: SfdFilterProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-4">
      <div className="flex-1 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une SFD..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="w-full md:w-1/5">
        <Select
          value={statusFilter}
          onValueChange={onStatusFilterChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="suspended">Suspendus</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex space-x-2">
        {onExportPdf && (
          <Button 
            variant="outline" 
            onClick={onExportPdf}
            disabled={isExporting}
          >
            <FileDown className="mr-2 h-4 w-4" />
            PDF
          </Button>
        )}
        
        {onExportExcel && (
          <Button 
            variant="outline" 
            onClick={onExportExcel}
            disabled={isExporting}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Excel
          </Button>
        )}
        
        {onExportCsv && (
          <Button 
            variant="outline" 
            onClick={onExportCsv}
            disabled={isExporting}
          >
            <FileDown className="mr-2 h-4 w-4" />
            CSV
          </Button>
        )}
      </div>
    </div>
  );
}

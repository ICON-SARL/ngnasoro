
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/auditLogger';
import { AuditLogFiltersProps } from './types';

export function AuditLogFilters({ 
  filters, 
  handleFilterChange, 
  handleClearFilters, 
  handleApplyFilters 
}: AuditLogFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-8"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          />
        </div>
      </div>
      
      <Select 
        value={filters.categoryFilter} 
        onValueChange={val => handleFilterChange('categoryFilter', val)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrer par catégorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Toutes les catégories</SelectItem>
          <SelectItem value={AuditLogCategory.SFD_OPERATIONS}>Opérations SFD</SelectItem>
          <SelectItem value={AuditLogCategory.AUTHENTICATION}>Authentification</SelectItem>
          <SelectItem value={AuditLogCategory.DATA_ACCESS}>Accès aux données</SelectItem>
          <SelectItem value={AuditLogCategory.CONFIGURATION}>Configuration</SelectItem>
        </SelectContent>
      </Select>
      
      <Select 
        value={filters.severityFilter} 
        onValueChange={val => handleFilterChange('severityFilter', val)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrer par sévérité" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Toutes les sévérités</SelectItem>
          <SelectItem value={AuditLogSeverity.INFO}>Info</SelectItem>
          <SelectItem value={AuditLogSeverity.WARNING}>Avertissement</SelectItem>
          <SelectItem value={AuditLogSeverity.ERROR}>Erreur</SelectItem>
          <SelectItem value={AuditLogSeverity.CRITICAL}>Critique</SelectItem>
        </SelectContent>
      </Select>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[180px] pl-3 text-left font-normal">
            {filters.startDate ? format(filters.startDate, 'dd/MM/yyyy') : "Date de début"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.startDate}
            onSelect={(date) => handleFilterChange('startDate', date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[180px] pl-3 text-left font-normal">
            {filters.endDate ? format(filters.endDate, 'dd/MM/yyyy') : "Date de fin"}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.endDate}
            onSelect={(date) => handleFilterChange('endDate', date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {(filters.startDate || filters.endDate || filters.categoryFilter || 
        filters.severityFilter || filters.searchTerm) && (
        <Button 
          variant="ghost" 
          onClick={handleClearFilters}
        >
          Réinitialiser les filtres
        </Button>
      )}
      
      <Button onClick={handleApplyFilters}>
        Appliquer
      </Button>
    </div>
  );
}

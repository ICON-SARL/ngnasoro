
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { AuditLogFiltersProps } from './types';
import { Search, X } from 'lucide-react';

export function AuditLogFilters({
  filters,
  handleFilterChange,
  handleClearFilters,
  handleApplyFilters
}: AuditLogFiltersProps) {
  return (
    <div className="bg-card p-4 rounded-md shadow-sm space-y-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Recherche</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher dans l'historique..."
              className="pl-8"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Catégorie</label>
          <Select
            value={filters.categoryFilter}
            onValueChange={(value) => handleFilterChange('categoryFilter', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les catégories</SelectItem>
              <SelectItem value="sfd_operations">Opérations SFD</SelectItem>
              <SelectItem value="user_management">Gestion Utilisateurs</SelectItem>
              <SelectItem value="data_access">Accès aux données</SelectItem>
              <SelectItem value="configuration">Configuration</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Sévérité</label>
          <Select
            value={filters.severityFilter}
            onValueChange={(value) => handleFilterChange('severityFilter', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les sévérités" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les sévérités</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Avertissement</SelectItem>
              <SelectItem value="error">Erreur</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Depuis</label>
          <DatePicker
            selected={filters.startDate}
            onSelect={(date) => handleFilterChange('startDate', date)}
            placeholder="Date de début"
          />
        </div>
        
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Jusqu'à</label>
          <DatePicker
            selected={filters.endDate}
            onSelect={(date) => handleFilterChange('endDate', date)}
            placeholder="Date de fin"
          />
        </div>
        
        <div className="flex-1 flex items-end space-x-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleClearFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Effacer
          </Button>
          
          <Button 
            className="flex-1"
            onClick={handleApplyFilters}
          >
            Appliquer
          </Button>
        </div>
      </div>
    </div>
  );
}

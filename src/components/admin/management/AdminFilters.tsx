
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { AdminRole, AdminFilterOptions } from './types';
import { useSFDList } from './hooks/useSFDList';

interface AdminFiltersProps {
  filters: AdminFilterOptions;
  onFilterChange: (filters: AdminFilterOptions) => void;
  onReset: () => void;
}

export const AdminFilters: React.FC<AdminFiltersProps> = ({
  filters,
  onFilterChange,
  onReset
}) => {
  const { sfds } = useSFDList();
  
  const handleFilterChange = (key: keyof AdminFilterOptions, value: string | boolean | undefined) => {
    onFilterChange({ ...filters, [key]: value });
  };
  
  return (
    <div className="bg-white p-4 rounded-lg border mb-4 flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[200px]">
        <Select 
          value={filters.role} 
          onValueChange={(value) => handleFilterChange('role', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les rôles</SelectItem>
            <SelectItem value={AdminRole.SUPER_ADMIN}>Super Admin</SelectItem>
            <SelectItem value={AdminRole.SFD_ADMIN}>Admin SFD</SelectItem>
            <SelectItem value={AdminRole.SUPPORT}>Support</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <Select 
          value={filters.sfd_id} 
          onValueChange={(value) => handleFilterChange('sfd_id', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par SFD" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes les SFD</SelectItem>
            {sfds.map(sfd => (
              <SelectItem key={sfd.id} value={sfd.id}>{sfd.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <Select 
          value={filters.is_active !== undefined ? filters.is_active.toString() : ''} 
          onValueChange={(value) => handleFilterChange('is_active', 
            value === '' ? undefined : value === 'true')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tous les statuts</SelectItem>
            <SelectItem value="true">Actifs</SelectItem>
            <SelectItem value="false">Inactifs</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={onReset}>
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};

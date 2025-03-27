
import { SfdAuditLog } from '../types/sfd-types';

export interface AuditLogFilterState {
  searchTerm: string;
  categoryFilter: string;
  severityFilter: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export interface AuditLogHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  fetchLogs: () => void;
}

export interface AuditLogFiltersProps {
  filters: AuditLogFilterState;
  handleFilterChange: (key: keyof AuditLogFilterState, value: any) => void;
  handleClearFilters: () => void;
  handleApplyFilters: () => void;
}

export interface AuditLogTableProps {
  logs: SfdAuditLog[];
  isLoading: boolean;
}

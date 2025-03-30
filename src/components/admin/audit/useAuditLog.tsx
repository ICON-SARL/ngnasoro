
import { useState, useEffect } from 'react';
import { getAuditLogs } from '@/utils/audit/auditLoggerCore';
import { AuditLogEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

export type SfdAuditLog = AuditLogEvent & { id: string; created_at: string };

export interface AuditLogFilterState {
  searchTerm: string;
  categoryFilter: string;
  severityFilter: string;
  startDate?: Date;
  endDate?: Date;
}

export function useAuditLog() {
  const [auditLogs, setAuditLogs] = useState<SfdAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilterState>({
    searchTerm: '',
    categoryFilter: '',
    severityFilter: '',
    startDate: undefined,
    endDate: undefined,
  });
  
  // Fetch audit logs with current filters
  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const options: any = {
        limit: 100,
      };
      
      if (filters.categoryFilter) {
        options.category = filters.categoryFilter as AuditLogCategory;
      }
      
      if (filters.severityFilter) {
        options.severity = filters.severityFilter as AuditLogSeverity;
      }
      
      if (filters.startDate) {
        options.startDate = filters.startDate;
      }
      
      if (filters.endDate) {
        options.endDate = filters.endDate;
      }
      
      const response = await getAuditLogs(options);
      
      // Convert response.logs to SfdAuditLog[] type
      const typedLogs: SfdAuditLog[] = response.logs.map(log => ({
        ...log,
        id: (log as any).id || '',
        created_at: (log as any).created_at || new Date().toISOString()
      }));
      
      setAuditLogs(typedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchAuditLogs();
  }, []);
  
  // Handle filter change
  const handleFilterChange = (key: keyof AuditLogFilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Reset all filters
  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      categoryFilter: '',
      severityFilter: '',
      startDate: undefined,
      endDate: undefined,
    });
  };
  
  // Apply current filters and fetch logs
  const handleApplyFilters = () => {
    setSearchTerm(filters.searchTerm);
    fetchAuditLogs();
  };
  
  // Filter logs by search term
  const filteredLogs = auditLogs.filter(log => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(searchLower)) ||
      (log.user_id && log.user_id.toLowerCase().includes(searchLower)) ||
      (log.target_resource && log.target_resource.toLowerCase().includes(searchLower)) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchLower))
    );
  });
  
  return {
    logs: filteredLogs,
    isLoading,
    showFilters,
    setShowFilters,
    filters,
    handleFilterChange,
    handleClearFilters,
    handleApplyFilters,
    fetchAuditLogs
  };
}

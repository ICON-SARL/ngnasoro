
import { useState, useEffect } from 'react';
import { getAuditLogs } from '@/utils/auditLogger';
import { SfdAuditLog } from '../types/sfd-types';
import { AuditLogFilterState } from './types';

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
        options.category = filters.categoryFilter;
      }
      
      if (filters.severityFilter) {
        options.severity = filters.severityFilter;
      }
      
      if (filters.startDate) {
        options.startDate = filters.startDate.toISOString();
      }
      
      if (filters.endDate) {
        options.endDate = filters.endDate.toISOString();
      }
      
      const logs = await getAuditLogs(options);
      setAuditLogs(logs);
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

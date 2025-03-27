
import { useState, useCallback } from 'react';
import { useSyncData } from '@/hooks/useSyncData';
import { toast } from '@/hooks/use-toast';
import { syncService } from '@/utils/api/syncService';
import { format } from 'date-fns';

export function useAuditLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const {
    pagination,
    goToPage,
    changePageSize,
    changeSorting,
    resetFilters,
    applyDateFilter,
    auditLogsQuery: { data: auditLogsData, isLoading, refetch }
  } = useSyncData();

  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);
  
  const handleApplyFilters = useCallback(() => {
    if (startDate || endDate) {
      applyDateFilter(
        startDate ? startDate.toISOString() : undefined,
        endDate ? endDate.toISOString() : undefined
      );
    }
    
    // The specific filters for audit logs will be applied through the hook
    refetch();
  }, [applyDateFilter, endDate, refetch, startDate]);
  
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSeverity('');
    setSelectedStatus('');
    setStartDate(undefined);
    setEndDate(undefined);
    resetFilters();
  }, [resetFilters]);
  
  const handleExportCsv = useCallback(async () => {
    try {
      toast({
        title: "Export en cours",
        description: "Préparation du fichier CSV...",
      });
      
      const filters = {
        ...(startDate ? { startDate: startDate.toISOString() } : {}),
        ...(endDate ? { endDate: endDate.toISOString() } : {}),
        ...(selectedCategory ? { category: selectedCategory } : {}),
        ...(selectedSeverity ? { severity: selectedSeverity } : {}),
        ...(selectedStatus ? { status: selectedStatus as 'success' | 'failure' } : {})
      };
      
      const blob = await syncService.exportAuditLogs(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `journal-audit-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Export réussi",
        description: "Le journal d'audit a été exporté avec succès",
      });
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export du journal d'audit",
        variant: "destructive"
      });
    }
  }, [endDate, selectedCategory, selectedSeverity, selectedStatus, startDate]);

  // Filter logs based on search term
  const filteredLogs = auditLogsData?.data?.filter(log => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(searchLower)) ||
      (log.user_id && log.user_id.toLowerCase().includes(searchLower)) ||
      (log.target_resource && log.target_resource.toLowerCase().includes(searchLower)) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchLower))
    );
  }) || [];
  
  const totalPages = auditLogsData?.pagination?.totalPages || 1;
  const totalItems = auditLogsData?.pagination?.totalCount || 0;

  return {
    // State
    searchTerm,
    setSearchTerm,
    showFilters,
    selectedCategory,
    setSelectedCategory,
    selectedSeverity,
    setSelectedSeverity,
    selectedStatus,
    setSelectedStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    
    // Data
    filteredLogs,
    isLoading,
    pagination,
    totalPages,
    totalItems,
    
    // Actions
    handleToggleFilters,
    handleApplyFilters,
    handleClearFilters,
    handleExportCsv,
    goToPage,
    changePageSize,
    refetch
  };
}

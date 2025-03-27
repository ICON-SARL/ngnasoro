
import { useQuery } from '@tanstack/react-query';
import { syncService, PaginationParams, DateFilter, SfdFilter, AuditLogFilter } from '@/utils/api/syncService';
import { useState } from 'react';

export function useSyncData() {
  // State for pagination and filters
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  
  const [dateFilter, setDateFilter] = useState<DateFilter>({});
  const [sfdFilter, setSfdFilter] = useState<SfdFilter>({});
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [auditFilter, setAuditFilter] = useState<AuditLogFilter>({});
  
  // Query for active SFDs
  const sfdsQuery = useQuery({
    queryKey: ['sfds', 'active'],
    queryFn: () => syncService.getActiveSfds(),
  });
  
  // Query for subsidies with pagination and filters
  const subsidiesQuery = useQuery({
    queryKey: ['subsidies', pagination, dateFilter, sfdFilter],
    queryFn: () => syncService.getSubsidies({
      ...pagination,
      ...dateFilter,
      ...sfdFilter
    }),
    placeholderData: (previousData) => previousData
  });
  
  // Query for loans with pagination and filters
  const loansQuery = useQuery({
    queryKey: ['loans', pagination, dateFilter, sfdFilter, statusFilter],
    queryFn: () => syncService.getLoans({
      ...pagination,
      ...dateFilter,
      ...sfdFilter,
      status: statusFilter
    }),
    placeholderData: (previousData) => previousData
  });
  
  // Query for subsidy requests with pagination and filters
  const subsidyRequestsQuery = useQuery({
    queryKey: ['subsidy-requests', pagination, dateFilter, sfdFilter, statusFilter, priorityFilter],
    queryFn: () => syncService.getSubsidyRequests({
      ...pagination,
      ...dateFilter,
      ...sfdFilter,
      status: statusFilter,
      priority: priorityFilter
    }),
    placeholderData: (previousData) => previousData
  });
  
  // Query for audit logs with pagination and filters
  const auditLogsQuery = useQuery({
    queryKey: ['audit-logs', pagination, dateFilter, auditFilter],
    queryFn: () => syncService.getAuditLogs({
      ...pagination,
      ...dateFilter,
      ...auditFilter
    }),
    placeholderData: (previousData) => previousData
  });
  
  // Helpers to change the filters
  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const changePageSize = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };
  
  const changeSorting = (sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    setPagination(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };
  
  const applyDateFilter = (startDate?: string, endDate?: string) => {
    setDateFilter({ startDate, endDate });
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const applySfdFilter = (sfdId?: string) => {
    setSfdFilter(prev => ({ ...prev, sfdId }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const applyStatusFilter = (status?: string) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const applyPriorityFilter = (priority?: string) => {
    setPriorityFilter(priority);
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const applyAuditFilter = (filter: AuditLogFilter) => {
    setAuditFilter(filter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const resetFilters = () => {
    setDateFilter({});
    setSfdFilter({});
    setStatusFilter(undefined);
    setPriorityFilter(undefined);
    setAuditFilter({});
    setPagination({
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };
  
  return {
    // Queries
    sfdsQuery,
    subsidiesQuery,
    loansQuery,
    subsidyRequestsQuery,
    auditLogsQuery,
    
    // Filter states
    pagination,
    dateFilter,
    sfdFilter,
    statusFilter,
    priorityFilter,
    auditFilter,
    
    // Filter methods
    goToPage,
    changePageSize,
    changeSorting,
    applyDateFilter,
    applySfdFilter,
    applyStatusFilter,
    applyPriorityFilter,
    applyAuditFilter,
    resetFilters
  };
}

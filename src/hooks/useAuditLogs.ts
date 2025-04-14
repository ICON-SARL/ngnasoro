
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  user_id: string;
  user_email?: string;
  action: string;
  category: 'AUTHENTICATION' | 'DATA_ACCESS' | 'ADMINISTRATION' | 'SECURITY' | 'FINANCIAL';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  status: 'success' | 'failure' | 'pending';
  target_resource: string;
  details?: Record<string, any>;
  error_message?: string;
  ip_address?: string;
  created_at: string;
}

export interface AuditLogFilters {
  category?: string | string[];
  severity?: string | string[];
  startDate?: string;
  endDate?: string;
  userId?: string;
  status?: 'success' | 'failure' | 'pending';
  limit?: number;
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
  const [isExporting, setIsExporting] = useState(false);

  // Mock data for audit logs
  const mockAuditLogs: AuditLog[] = [
    {
      id: "log1",
      user_id: "admin1",
      user_email: "admin@meref.org",
      action: "admin_login",
      category: "AUTHENTICATION",
      severity: "INFO",
      status: "success",
      target_resource: "auth/login",
      ip_address: "192.168.1.1",
      created_at: "2023-04-28T14:15:00Z"
    },
    {
      id: "log2",
      user_id: "admin1",
      user_email: "admin@meref.org",
      action: "credit_approval",
      category: "FINANCIAL",
      severity: "INFO",
      status: "success",
      target_resource: "credit/applications/CREDIT-2023-003",
      details: { application_id: "CREDIT-2023-003", amount: 7500000 },
      ip_address: "192.168.1.1",
      created_at: "2023-04-26T11:20:00Z"
    },
    {
      id: "log3",
      user_id: "sfdadmin1",
      user_email: "director@rcpb.org",
      action: "fund_request_submit",
      category: "FINANCIAL",
      severity: "INFO",
      status: "success",
      target_resource: "fund_requests/FR-2023-001",
      details: { request_id: "FR-2023-001", amount: 5000000 },
      ip_address: "192.168.1.50",
      created_at: "2023-04-25T10:30:00Z"
    },
    {
      id: "log4",
      user_id: "admin1",
      user_email: "admin@meref.org",
      action: "sfd_suspend",
      category: "ADMINISTRATION",
      severity: "WARNING",
      status: "success",
      target_resource: "sfds/sfd3",
      details: { sfd_id: "sfd3", reason: "compliance_issues" },
      ip_address: "192.168.1.1",
      created_at: "2023-04-24T09:45:00Z"
    },
    {
      id: "log5",
      user_id: "unknown",
      action: "failed_login_attempt",
      category: "SECURITY",
      severity: "WARNING",
      status: "failure",
      target_resource: "auth/login",
      error_message: "Invalid credentials",
      ip_address: "203.0.113.42",
      created_at: "2023-04-23T16:30:00Z"
    }
  ];

  // Function to fetch audit logs with filtering
  const fetchAuditLogs = async (): Promise<AuditLog[]> => {
    try {
      // In a real implementation, we would fetch from Supabase with filters
      // For now, apply filters to mock data
      let filteredLogs = [...mockAuditLogs];
      
      if (filters.category) {
        const categories = Array.isArray(filters.category) ? filters.category : [filters.category];
        filteredLogs = filteredLogs.filter(log => categories.includes(log.category));
      }
      
      if (filters.severity) {
        const severities = Array.isArray(filters.severity) ? filters.severity : [filters.severity];
        filteredLogs = filteredLogs.filter(log => severities.includes(log.severity));
      }
      
      if (filters.status) {
        filteredLogs = filteredLogs.filter(log => log.status === filters.status);
      }
      
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.user_id === filters.userId);
      }
      
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.created_at) >= startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.created_at) <= endDate);
      }
      
      if (filters.limit) {
        filteredLogs = filteredLogs.slice(0, filters.limit);
      }
      
      return filteredLogs;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  };

  // Use React Query to manage the data fetching
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: fetchAuditLogs,
    initialData: mockAuditLogs
  });

  // Export audit logs to CSV
  const exportLogsToCSV = async (): Promise<string> => {
    setIsExporting(true);
    try {
      const auditLogs = await fetchAuditLogs();
      
      // Generate CSV header
      const header = [
        'ID',
        'Timestamp',
        'User ID',
        'User Email',
        'Action',
        'Category',
        'Severity',
        'Status',
        'Target Resource',
        'IP Address',
        'Error Message',
        'Details'
      ].join(',');
      
      // Generate CSV rows
      const rows = auditLogs.map(log => {
        return [
          log.id,
          log.created_at,
          log.user_id,
          log.user_email || '',
          log.action,
          log.category,
          log.severity,
          log.status,
          log.target_resource,
          log.ip_address || '',
          log.error_message || '',
          log.details ? JSON.stringify(log.details).replace(/,/g, ';') : ''
        ].join(',');
      });
      
      // Combine header and rows
      const csvContent = [header, ...rows].join('\n');
      
      return csvContent;
    } catch (error) {
      console.error('Error exporting logs to CSV:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    logs: logs || [],
    isLoading,
    isExporting,
    refetch,
    exportLogsToCSV
  };
}


import { useState, useEffect, useCallback } from 'react';
import { logAuditEvent } from '@/utils/audit';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

// Mock data for demonstration purposes
const mockRoles = [
  { 
    id: '1', 
    name: 'Super Admin', 
    type: 'SUPER_ADMIN',
    permissions: ['manage_sfds', 'manage_admins', 'view_logs', 'approve_subsidies'] 
  },
  { 
    id: '2', 
    name: 'Admin SFD', 
    type: 'SFD_ADMIN',
    permissions: ['manage_clients', 'manage_loans', 'view_clients', 'issue_subsidies'] 
  },
  { 
    id: '3', 
    name: 'Agent SFD', 
    type: 'SFD_AGENT',
    permissions: ['view_clients', 'create_loans', 'view_loans'] 
  },
  { 
    id: '4', 
    name: 'Caissier', 
    type: 'SFD_CASHIER',
    permissions: ['view_clients', 'process_payments'] 
  },
  { 
    id: '5', 
    name: 'Admin MEREF', 
    type: 'MEREF_ADMIN',
    permissions: ['manage_subsidies', 'view_sfds', 'view_statistics'] 
  }
];

export function useRoleAudit() {
  const [roles, setRoles] = useState(mockRoles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter roles based on search query
  const filteredRoles = roles.filter(role => {
    const searchLower = searchQuery.toLowerCase();
    return (
      role.name.toLowerCase().includes(searchLower) ||
      role.type.toLowerCase().includes(searchLower) ||
      role.permissions.some(perm => perm.toLowerCase().includes(searchLower))
    );
  });

  // Function to run the audit
  const runAudit = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Log the audit action
      await logAuditEvent({
        category: AuditLogCategory.SECURITY,
        action: 'run_role_audit',
        status: 'success',
        severity: AuditLogSeverity.INFO,
        metadata: {
          triggered_by: 'manual',
          timestamp: new Date().toISOString()
        }
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real application, this would fetch data from the API
      setRoles(mockRoles);
      
    } catch (err) {
      console.error("Role audit error:", err);
      setError("Une erreur s'est produite lors de l'audit des rôles.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    runAudit();
  }, [runAudit]);

  return {
    roles,
    isLoading,
    error,
    runAudit,
    searchQuery,
    setSearchQuery,
    filteredRoles
  };
}

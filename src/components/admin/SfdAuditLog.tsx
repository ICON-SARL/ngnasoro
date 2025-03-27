
import React from 'react';
import { 
  AuditLogHeader, 
  AuditLogFilters, 
  AuditLogTable,
  useAuditLog
} from './audit';

export function SfdAuditLog() {
  const {
    logs,
    isLoading,
    showFilters,
    setShowFilters,
    filters,
    handleFilterChange,
    handleClearFilters,
    handleApplyFilters,
    fetchAuditLogs
  } = useAuditLog();

  return (
    <div className="space-y-4">
      <AuditLogHeader 
        showFilters={showFilters} 
        setShowFilters={setShowFilters} 
        fetchLogs={fetchAuditLogs}
      />
      
      {showFilters && (
        <AuditLogFilters 
          filters={filters}
          handleFilterChange={handleFilterChange}
          handleClearFilters={handleClearFilters}
          handleApplyFilters={handleApplyFilters}
        />
      )}
      
      <AuditLogTable 
        logs={logs}
        isLoading={isLoading}
      />
    </div>
  );
}


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DataPagination } from '@/components/ui/data-pagination';
import {
  AuditLogHeader,
  AuditLogFilters,
  AuditLogTable,
  EmptyState,
  LoadingState
} from '@/components/admin/audit-log';
import { useAuditLog } from '@/components/admin/audit-log/useAuditLog';

export function SfdAuditLog() {
  const {
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
  } = useAuditLog();
  
  return (
    <div className="space-y-6">
      <AuditLogHeader 
        onToggleFilters={handleToggleFilters}
        onRefresh={refetch}
        onExportCsv={handleExportCsv}
      />
      
      {showFilters && (
        <AuditLogFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSeverity={selectedSeverity}
          setSelectedSeverity={setSelectedSeverity}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
      )}
      
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <LoadingState />
          ) : filteredLogs.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <AuditLogTable logs={filteredLogs} />
              
              <DataPagination
                currentPage={pagination.page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pagination.pageSize}
                onPageChange={goToPage}
                onPageSizeChange={changePageSize}
                className="mt-4"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

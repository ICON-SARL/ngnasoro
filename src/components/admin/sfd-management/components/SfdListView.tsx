
import React from 'react';
import { SfdTable } from '../../sfd/SfdTable';
import { SfdFilter } from '../../sfd/SfdFilter';
import { Loader } from '@/components/ui/loader';
import { Sfd, SfdStatus } from '../../types/sfd-types';

interface SfdListViewProps {
  filteredSfds: Sfd[];
  isLoading: boolean;
  isError: boolean;
  searchTerm: string;
  statusFilter: SfdStatus | null;
  handleSearchChange: (value: string) => void;
  handleStatusFilterChange: (value: string) => void;
  handleSuspendSfd: (sfd: Sfd) => void;
  handleReactivateSfd: (sfd: Sfd) => void;
  handleShowEditDialog: (sfd: Sfd) => void;
  handleViewDetails: (sfd: Sfd) => void;
  handleAddAdmin: (sfd: Sfd) => void;
  handleExportPdf: () => void;
  handleExportExcel: () => void;
}

export function SfdListView({
  filteredSfds,
  isLoading,
  isError,
  searchTerm,
  statusFilter,
  handleSearchChange,
  handleStatusFilterChange,
  handleSuspendSfd,
  handleReactivateSfd,
  handleShowEditDialog,
  handleViewDetails,
  handleAddAdmin,
  handleExportPdf,
  handleExportExcel,
}: SfdListViewProps) {
  return (
    <>
      <SfdFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter || 'all'}
        onStatusFilterChange={handleStatusFilterChange}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportExcel}
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-md border border-gray-200">
          <Loader size="lg" variant="primary" className="mb-4" />
          <p className="text-muted-foreground">Chargement des SFDs...</p>
        </div>
      ) : (
        <SfdTable 
          sfds={filteredSfds}
          isLoading={isLoading}
          isError={isError}
          onSuspend={handleSuspendSfd}
          onReactivate={handleReactivateSfd}
          onEdit={handleShowEditDialog}
          onViewDetails={handleViewDetails}
          onAddAdmin={handleAddAdmin}
        />
      )}
    </>
  );
}

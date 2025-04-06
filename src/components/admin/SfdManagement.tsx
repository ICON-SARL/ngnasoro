
import React, { useState } from 'react';
import { useSfdManagement } from './hooks/useSfdManagement';
import { SfdTable } from './sfd/SfdTable';
import { SuspendSfdDialog } from './sfd/SuspendSfdDialog';
import { ReactivateSfdDialog } from './sfd/ReactivateSfdDialog';
import { SfdForm } from './sfd/SfdForm';
import { SfdFilter } from './sfd/SfdFilter';
import { SfdDetailView } from './sfd/SfdDetailView';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Sfd } from './types/sfd-types';

export function SfdManagement() {
  const [showDetailsView, setShowDetailsView] = useState(false);
  const {
    filteredSfds,
    isLoading,
    isError,
    selectedSfd,
    setSelectedSfd, // This was missing
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showSuspendDialog,
    setShowSuspendDialog,
    showReactivateDialog,
    setShowReactivateDialog,
    showAddDialog,
    setShowAddDialog,
    showEditDialog,
    setShowEditDialog,
    suspendSfdMutation,
    reactivateSfdMutation,
    addSfdMutation,
    editSfdMutation,
    handleAddSfd,
    handleEditSfd,
    handleShowEditDialog,
    handleSuspendSfd,
    handleReactivateSfd,
    handleExportPdf,
    handleExportExcel
  } = useSfdManagement();

  const handleViewDetails = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowDetailsView(true);
  };

  if (showDetailsView && selectedSfd) {
    return (
      <SfdDetailView 
        sfd={selectedSfd} 
        onBack={() => setShowDetailsView(false)} 
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">
          Liste des SFDs ({filteredSfds?.length || 0})
        </h2>
        
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une SFD
        </Button>
      </div>
      
      <SfdFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportExcel}
      />
      
      <SfdTable 
        sfds={filteredSfds}
        isLoading={isLoading}
        isError={isError}
        onSuspend={handleSuspendSfd}
        onReactivate={handleReactivateSfd}
        onEdit={handleShowEditDialog}
        onViewDetails={handleViewDetails}
      />

      <SuspendSfdDialog
        open={showSuspendDialog}
        onOpenChange={setShowSuspendDialog}
        selectedSfd={selectedSfd}
        onConfirm={(sfdId) => suspendSfdMutation.mutate(sfdId)}
        isPending={suspendSfdMutation.isPending}
      />

      <ReactivateSfdDialog
        open={showReactivateDialog}
        onOpenChange={setShowReactivateDialog}
        selectedSfd={selectedSfd}
        onConfirm={(sfdId) => reactivateSfdMutation.mutate(sfdId)}
        isPending={reactivateSfdMutation.isPending}
      />
      
      <SfdForm
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddSfd}
        title="Ajouter une nouvelle SFD"
        isPending={addSfdMutation.isPending}
      />
      
      <SfdForm
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleEditSfd}
        initialData={selectedSfd || {}}
        title="Modifier la SFD"
        isPending={editSfdMutation.isPending}
      />
    </div>
  );
}

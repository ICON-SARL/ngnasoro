
import React, { useState } from 'react';
import { useSfdManagement } from '../hooks/useSfdManagement';
import { SfdTable } from '../sfd/SfdTable';
import { SfdFilter } from '../sfd/SfdFilter';
import { SfdToolbar } from './SfdToolbar';
import { SfdDialogs } from './SfdDialogs';
import { SfdDetailView } from '../sfd/SfdDetailView';
import { Sfd } from '../types/sfd-types';
import { useSfdAdminManagement } from '../hooks/useSfdAdminManagement';
import { AddSfdAdminDialog } from '../sfd/AddSfdAdminDialog';

export function SfdManagementContainer() {
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [selectedSfdForAdmin, setSelectedSfdForAdmin] = useState<Sfd | null>(null);
  
  const {
    filteredSfds,
    isLoading,
    isError,
    selectedSfd,
    setSelectedSfd,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showSuspendDialog,
    setShowSuspendDialog,
    showReactivateDialog,
    setShowReactivateDialog,
    showActivateDialog,
    setShowActivateDialog,
    showAddDialog,
    setShowAddDialog,
    showEditDialog,
    setShowEditDialog,
    suspendSfdMutation,
    reactivateSfdMutation,
    activateSfdMutation,
    addSfdMutation,
    editSfdMutation,
    handleAddSfd,
    handleEditSfd,
    handleShowEditDialog,
    handleSuspendSfd,
    handleReactivateSfd,
    handleActivateSfd,
    handleExportPdf,
    handleExportExcel
  } = useSfdManagement();

  const { isLoading: isLoadingAdmin, error: adminError, addSfdAdmin } = useSfdAdminManagement();

  const handleViewDetails = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowDetailsView(true);
  };

  const handleAddAdmin = (sfd: Sfd) => {
    setSelectedSfdForAdmin(sfd);
    setShowAddAdminDialog(true);
  };

  if (showDetailsView && selectedSfd) {
    return (
      <SfdDetailView 
        sfd={selectedSfd} 
        onBack={() => setShowDetailsView(false)}
        onAddAdmin={() => handleAddAdmin(selectedSfd)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <SfdToolbar 
        sfdCount={filteredSfds?.length || 0}
        onAddSfd={() => setShowAddDialog(true)}
      />
      
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
        onActivate={handleActivateSfd}
        onEdit={handleShowEditDialog}
        onViewDetails={handleViewDetails}
        onAddAdmin={handleAddAdmin}
      />

      <SfdDialogs 
        showSuspendDialog={showSuspendDialog}
        setShowSuspendDialog={setShowSuspendDialog}
        showReactivateDialog={showReactivateDialog}
        setShowReactivateDialog={setShowReactivateDialog}
        showActivateDialog={showActivateDialog}
        setShowActivateDialog={setShowActivateDialog}
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        selectedSfd={selectedSfd}
        suspendSfdMutation={suspendSfdMutation}
        reactivateSfdMutation={reactivateSfdMutation}
        activateSfdMutation={activateSfdMutation}
        addSfdMutation={addSfdMutation}
        editSfdMutation={editSfdMutation}
        handleAddSfd={handleAddSfd}
        handleEditSfd={handleEditSfd}
      />

      {selectedSfdForAdmin && (
        <AddSfdAdminDialog
          open={showAddAdminDialog}
          onOpenChange={setShowAddAdminDialog}
          sfdId={selectedSfdForAdmin.id}
          sfdName={selectedSfdForAdmin.name}
          onAddAdmin={addSfdAdmin}
          isLoading={isLoadingAdmin}
          error={adminError}
        />
      )}
    </div>
  );
}

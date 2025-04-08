
import React, { useEffect } from 'react';
import { SfdToolbar } from './SfdToolbar';
import { SfdDetailView } from '../sfd/SfdDetailView';
import { SfdListView } from './components/SfdListView';
import { SfdDialogManager } from './components/SfdDialogManager';
import { useSfdContainerState } from './hooks/useSfdContainerState';

export function SfdManagementContainer() {
  const {
    showDetailsView,
    setShowDetailsView,
    showAddAdminDialog,
    setShowAddAdminDialog,
    selectedSfdForAdmin,
    filteredSfds,
    isLoading,
    isError,
    selectedSfd,
    searchTerm,
    statusFilter,
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
    handleViewDetails,
    handleAddAdmin,
    handleSubmitAddAdmin,
    handleStatusFilterChange,
    setSearchTerm,
    handleExportPdf,
    handleExportExcel,
    refetch,
    queryClient,
    isLoadingAdmin,
    adminError
  } = useSfdContainerState();

  // Rafraîchir la liste des SFDs au chargement initial
  useEffect(() => {
    console.log("Initializing SFD management: forcing initial data refresh");
    
    // Supprimer les données en cache pour forcer un refetch frais
    queryClient.removeQueries({ queryKey: ['sfds'] });
    
    // Refetch immédiat
    refetch();
    
    // Interval de rafraîchissement plus modéré (toutes les 30 secondes)
    const intervalId = setInterval(() => {
      console.log("Periodic SFD refresh triggered");
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
    }, 30000); 
    
    return () => clearInterval(intervalId);
  }, [refetch, queryClient]);

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
      
      <SfdListView
        filteredSfds={filteredSfds}
        isLoading={isLoading}
        isError={isError}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        handleSearchChange={setSearchTerm}
        handleStatusFilterChange={handleStatusFilterChange}
        handleSuspendSfd={handleSuspendSfd}
        handleReactivateSfd={handleReactivateSfd}
        handleShowEditDialog={handleShowEditDialog}
        handleViewDetails={handleViewDetails}
        handleAddAdmin={handleAddAdmin}
        handleExportPdf={handleExportPdf}
        handleExportExcel={handleExportExcel}
      />

      <SfdDialogManager
        showSuspendDialog={showSuspendDialog}
        setShowSuspendDialog={setShowSuspendDialog}
        showReactivateDialog={showReactivateDialog}
        setShowReactivateDialog={setShowReactivateDialog}
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        showAddAdminDialog={showAddAdminDialog}
        setShowAddAdminDialog={setShowAddAdminDialog}
        selectedSfd={selectedSfd}
        selectedSfdForAdmin={selectedSfdForAdmin}
        suspendSfdMutation={suspendSfdMutation}
        reactivateSfdMutation={reactivateSfdMutation}
        addSfdMutation={addSfdMutation}
        editSfdMutation={editSfdMutation}
        handleAddSfd={handleAddSfd}
        handleEditSfd={handleEditSfd}
        handleSubmitAddAdmin={handleSubmitAddAdmin}
        isLoadingAdmin={isLoadingAdmin}
        adminError={adminError}
      />
    </div>
  );
}

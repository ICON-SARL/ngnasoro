
import React, { useState, useEffect } from 'react';
import { useSfdManagement } from '../hooks/useSfdManagement';
import { SfdTable } from '../sfd/SfdTable';
import { SfdFilter } from '../sfd/SfdFilter';
import { SfdToolbar } from './SfdToolbar';
import { SfdDialogs } from './SfdDialogs';
import { SfdDetailView } from '../sfd/SfdDetailView';
import { Sfd, SfdStatus } from '../types/sfd-types';
import { useSfdAdminManagement } from '@/hooks/useSfdAdminManagement';
import { AddSfdAdminDialog } from '../sfd/add-admin-dialog';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export function SfdManagementContainer() {
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [selectedSfdForAdmin, setSelectedSfdForAdmin] = useState<Sfd | null>(null);
  const queryClient = useQueryClient();
  
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
    handleExportExcel,
    refetch,
    startPolling
  } = useSfdManagement();

  const { isLoading: isLoadingAdmin, error: adminError, addSfdAdmin } = useSfdAdminManagement();

  // Rafraîchir la liste des SFDs au chargement initial et à intervalles réguliers
  useEffect(() => {
    console.log("Initializing SFD management: forcing initial data refresh");
    
    // Supprimer les données en cache pour forcer un refetch frais
    queryClient.removeQueries({ queryKey: ['sfds'] });
    
    // Refetch immédiat
    refetch();
    
    // Démarrer le polling si disponible
    if (typeof startPolling === 'function') {
      startPolling();
    }
    
    // Configurer un intervalle de rafraîchissement plus agressif
    const intervalId = setInterval(() => {
      console.log("Periodic SFD refresh triggered");
      
      // Supprimer d'abord les données en cache
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      refetch();
    }, 5000); // Toutes les 5 secondes
    
    return () => clearInterval(intervalId);
  }, [refetch, queryClient, startPolling]);

  const handleViewDetails = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowDetailsView(true);
  };

  const handleAddAdmin = (sfd: Sfd) => {
    console.log("Opening add admin dialog for SFD:", sfd);
    setSelectedSfdForAdmin(sfd);
    setShowAddAdminDialog(true);
  };

  const handleSubmitAddAdmin = (data: any) => {
    console.log("Submitting admin data with:", data);
    addSfdAdmin(data, {
      onSuccess: () => {
        setShowAddAdminDialog(false);
        toast({
          title: "Succès",
          description: "L'administrateur SFD a été créé avec succès"
        });
      }
    });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as SfdStatus | null);
  };

  const handleSuccessfulSfdAdd = (formData: any) => {
    addSfdMutation.mutate(formData, {
      onSuccess: () => {
        setShowAddDialog(false);
        toast({
          title: 'SFD ajoutée avec succès',
          description: 'La nouvelle SFD a été ajoutée et apparaîtra dans quelques instants'
        });
        console.log("SFD added successfully, starting aggressive polling...");
        
        // Start aggressive polling if the function exists
        if (typeof startPolling === 'function') {
          startPolling();
        }
        
        queryClient.invalidateQueries({ queryKey: ['sfds'] });
        queryClient.refetchQueries({ queryKey: ['sfds'] });
        
        // Double-check after a short delay
        setTimeout(() => {
          console.log("Performing backup refetch after SFD creation");
          queryClient.invalidateQueries({ queryKey: ['sfds'] });
          refetch();
        }, 2000);
      }
    });
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
        onStatusFilterChange={handleStatusFilterChange}
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
        onAddAdmin={handleAddAdmin}
      />

      <SfdDialogs 
        showSuspendDialog={showSuspendDialog}
        setShowSuspendDialog={setShowSuspendDialog}
        showReactivateDialog={showReactivateDialog}
        setShowReactivateDialog={setShowReactivateDialog}
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        selectedSfd={selectedSfd}
        suspendSfdMutation={suspendSfdMutation}
        reactivateSfdMutation={reactivateSfdMutation}
        addSfdMutation={addSfdMutation}
        editSfdMutation={editSfdMutation}
        handleAddSfd={handleSuccessfulSfdAdd}
        handleEditSfd={handleEditSfd}
      />

      {selectedSfdForAdmin && (
        <AddSfdAdminDialog
          isOpen={showAddAdminDialog}
          onOpenChange={setShowAddAdminDialog}
          sfdId={selectedSfdForAdmin.id}
          sfdName={selectedSfdForAdmin.name}
          onAddAdmin={handleSubmitAddAdmin}
          isLoading={isLoadingAdmin}
          error={adminError ? (typeof adminError === 'string' ? adminError : adminError.message) : null}
        />
      )}
    </div>
  );
}

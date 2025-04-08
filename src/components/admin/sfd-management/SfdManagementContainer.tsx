
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
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Loader } from '@/components/ui/loader';

export function SfdManagementContainer() {
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [selectedSfdForAdmin, setSelectedSfdForAdmin] = useState<Sfd | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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

  // Rafraîchir la liste des SFDs au chargement initial, mais avec une logique de rafraîchissement modérée
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
        
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: ['sfds'] });
        
        // Start polling if available
        if (typeof startPolling === 'function') {
          startPolling();
        }
        
        // Double-check after a short delay
        setTimeout(() => {
          console.log("Performing backup refetch after SFD creation");
          refetch();
        }, 2000);
      },
      onError: (error) => {
        toast({
          title: 'Erreur',
          description: `L'ajout de la SFD a échoué: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          variant: 'destructive'
        });
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

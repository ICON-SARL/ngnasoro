
import { useState } from 'react';
import { Sfd } from '../../types/sfd-types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useSfdAdminManagement } from '@/hooks/useSfdAdminManagement';
import { useSfdManagement } from '../../hooks/useSfdManagement';

export function useSfdContainerState() {
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
    setStatusFilter(value === 'all' ? null : value as any);
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

  return {
    showDetailsView,
    setShowDetailsView,
    showAddAdminDialog,
    setShowAddAdminDialog,
    selectedSfdForAdmin,
    filteredSfds,
    isLoading,
    isError,
    selectedSfd,
    setSelectedSfd,
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
    handleAddSfd: handleSuccessfulSfdAdd,
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
  };
}

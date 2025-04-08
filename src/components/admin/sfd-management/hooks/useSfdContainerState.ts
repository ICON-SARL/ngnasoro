
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
        
        // Force une invalidation immédiate et un refetch des SFDs
        queryClient.removeQueries({ queryKey: ['sfds'] });
        queryClient.invalidateQueries({ queryKey: ['sfds'] });
        
        // Implémenter une stratégie de polling plus agressive
        if (typeof startPolling === 'function') {
          console.log("Démarrage d'un polling agressif après l'ajout de SFD...");
          startPolling();
        }
        
        // Effectuer plusieurs tentatives de refetch à intervalles
        setTimeout(() => {
          console.log("Premier refetch après la création de SFD");
          refetch();
        }, 500);
        
        setTimeout(() => {
          console.log("Deuxième refetch après la création de SFD");
          queryClient.resetQueries({ queryKey: ['sfds'] });
          refetch();
        }, 2000);
        
        setTimeout(() => {
          console.log("Troisième refetch après la création de SFD");
          refetch();
        }, 4000);
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

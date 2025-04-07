
import { useState } from 'react';
import { Sfd } from '../../types/sfd-types';
import { SfdFormValues } from '../../sfd/schemas/sfdFormSchema';
import { useSfdData } from './useSfdData';
import { useSfdMutations } from './useSfdMutations';
import { useSfdFilters } from './useSfdFilters';
import { useSfdExport } from './useSfdExport';

export function useSfdManagement() {
  // Local state
  const [selectedSfd, setSelectedSfd] = useState<Sfd | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Use the sub-hooks
  const { sfds, isLoading, isError } = useSfdData();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredSfds } = useSfdFilters(sfds);
  const { 
    addSfdMutation, 
    editSfdMutation, 
    suspendSfdMutation, 
    reactivateSfdMutation 
  } = useSfdMutations();
  const { handleExportPdf, handleExportExcel, isExporting } = useSfdExport(filteredSfds, statusFilter);

  // Event handlers
  const handleAddSfd = (formData: SfdFormValues) => {
    addSfdMutation.mutate(formData);
    setShowAddDialog(false);
  };

  const handleEditSfd = (formData: SfdFormValues) => {
    if (selectedSfd) {
      editSfdMutation.mutate({ id: selectedSfd.id, data: formData });
      setShowEditDialog(false);
    }
  };

  const handleShowEditDialog = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowEditDialog(true);
  };

  const handleSuspendSfd = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowSuspendDialog(true);
  };

  const handleReactivateSfd = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowReactivateDialog(true);
  };

  return {
    sfds,
    filteredSfds,
    isLoading,
    isError,
    isExporting,
    selectedSfd,
    setSelectedSfd, // Export this function
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
  };
}

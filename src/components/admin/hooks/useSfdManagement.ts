
import { useState } from 'react';
import { Sfd } from '../types/sfd-types';
import { SfdFormValues } from '../sfd/schemas/sfdFormSchema';
import { useSfdData } from './sfd-management/useSfdData';
import { useSfdMutations } from './sfd-management/useSfdMutations';
import { useSfdFilters } from './sfd-management/useSfdFilters';
import { useSfdExport } from './sfd-management/useSfdExport';

export function useSfdManagement() {
  // Local state
  const [selectedSfd, setSelectedSfd] = useState<Sfd | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Use the sub-hooks
  const { sfds, isLoading, isError, refetch } = useSfdData();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter, filteredSfds } = useSfdFilters(sfds);
  const { 
    addSfdMutation, 
    editSfdMutation, 
    suspendSfdMutation, 
    reactivateSfdMutation,
    activateSfdMutation
  } = useSfdMutations();
  const { handleExportPdf, handleExportExcel, isExporting } = useSfdExport(filteredSfds, statusFilter);

  // Event handlers
  const handleAddSfd = (formData: SfdFormValues) => {
    addSfdMutation.mutate(formData);
    setShowAddDialog(false);
  };

  const handleEditSfd = (formData: SfdFormValues) => {
    if (selectedSfd) {
      console.log('Editing SFD:', selectedSfd.id, formData);
      editSfdMutation.mutate({ id: selectedSfd.id, data: formData });
      setShowEditDialog(false);
    }
  };

  const handleShowEditDialog = (sfd: Sfd) => {
    console.log('Setting selected SFD for edit:', sfd);
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

  const handleActivateSfd = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowActivateDialog(true);
  };

  return {
    sfds,
    filteredSfds,
    isLoading,
    isError,
    isExporting,
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
    handleExportExcel,
    refetch
  };
}


import { useState } from 'react';
import { Sfd } from '../../types/sfd-types';
import { SfdFormValues } from '@/components/admin/sfd/schemas/sfdFormSchema';
import { useSfdData } from './useSfdData';
import { useSfdMutations } from './useSfdMutations';
import { useSfdFilters } from './useSfdFilters';
import { useSfdExport } from './useSfdExport';

export function useSfdManagement() {
  // Local state
  const [selectedSfd, setSelectedSfd] = useState<Sfd | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Use the sub-hooks
  const { sfds, isLoading, isError } = useSfdData();
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
    addSfdMutation.mutate({
      name: formData.name,
      code: formData.code,
      region: formData.region,
      status: formData.status,
      description: formData.description,
      contact_email: formData.contact_email,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      logo_url: formData.logo_url,
      legal_document_url: formData.legal_document_url,
      // Only include subsidy_balance during creation, not for updates
      ...(formData.subsidy_balance !== undefined && { subsidy_balance: formData.subsidy_balance })
    });
    setShowAddDialog(false);
  };

  const handleEditSfd = (formData: SfdFormValues) => {
    if (selectedSfd) {
      editSfdMutation.mutate({ 
        id: selectedSfd.id, 
        data: {
          name: formData.name,
          code: formData.code,
          region: formData.region,
          status: formData.status,
          description: formData.description,
          contact_email: formData.contact_email,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          logo_url: formData.logo_url,
          legal_document_url: formData.legal_document_url
          // Note: We don't include subsidy_balance in edit operations
        }
      });
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
    handleExportExcel
  };
}

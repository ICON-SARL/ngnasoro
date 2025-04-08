
import React from 'react';
import { SfdDialogs } from '../SfdDialogs';
import { AddSfdAdminDialog } from '../../sfd/add-admin-dialog';
import { Sfd } from '../../types/sfd-types';
import { SfdFormValues } from '../../sfd/schemas/sfdFormSchema';
import { UseMutationResult } from '@tanstack/react-query';

interface SfdDialogManagerProps {
  showSuspendDialog: boolean;
  setShowSuspendDialog: (show: boolean) => void;
  showReactivateDialog: boolean;
  setShowReactivateDialog: (show: boolean) => void;
  showAddDialog: boolean;
  setShowAddDialog: (show: boolean) => void;
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  showAddAdminDialog: boolean;
  setShowAddAdminDialog: (show: boolean) => void;
  selectedSfd: Sfd | null;
  selectedSfdForAdmin: Sfd | null;
  suspendSfdMutation: UseMutationResult<any, Error, string>;
  reactivateSfdMutation: UseMutationResult<any, Error, string>;
  addSfdMutation: UseMutationResult<any, Error, SfdFormValues>;
  editSfdMutation: UseMutationResult<any, Error, { id: string; data: SfdFormValues }>;
  handleAddSfd: (formData: SfdFormValues) => void;
  handleEditSfd: (formData: SfdFormValues) => void;
  handleSubmitAddAdmin: (data: any) => void;
  isLoadingAdmin: boolean;
  adminError: Error | null;
}

export function SfdDialogManager({
  showSuspendDialog,
  setShowSuspendDialog,
  showReactivateDialog,
  setShowReactivateDialog,
  showAddDialog,
  setShowAddDialog,
  showEditDialog,
  setShowEditDialog,
  showAddAdminDialog,
  setShowAddAdminDialog,
  selectedSfd,
  selectedSfdForAdmin,
  suspendSfdMutation,
  reactivateSfdMutation,
  addSfdMutation,
  editSfdMutation,
  handleAddSfd,
  handleEditSfd,
  handleSubmitAddAdmin,
  isLoadingAdmin,
  adminError,
}: SfdDialogManagerProps) {
  return (
    <>
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
        handleAddSfd={handleAddSfd}
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
    </>
  );
}


import React from 'react';
import { SfdAddDialog } from '@/components/admin/sfd/SfdAddDialog';
import { SfdEditDialog } from '@/components/admin/sfd/SfdEditDialog';
import { SfdSuspendDialog } from '@/components/admin/sfd/SfdSuspendDialog';
import { SfdReactivateDialog } from '@/components/admin/sfd/SfdReactivateDialog';
import { SfdActivateDialog } from '@/components/admin/sfd/SfdActivateDialog';
import { Sfd } from '../types/sfd-types';
import { UseMutationResult } from '@tanstack/react-query';
import { SfdFormValues } from '@/components/admin/sfd/schemas/sfdFormSchema';

interface SfdDialogsProps {
  showSuspendDialog: boolean;
  setShowSuspendDialog: (value: boolean) => void;
  showReactivateDialog: boolean;
  setShowReactivateDialog: (value: boolean) => void;
  showActivateDialog: boolean;
  setShowActivateDialog: (value: boolean) => void;
  showAddDialog: boolean;
  setShowAddDialog: (value: boolean) => void;
  showEditDialog: boolean;
  setShowEditDialog: (value: boolean) => void;
  selectedSfd: Sfd | null;
  suspendSfdMutation: UseMutationResult<any, Error, string, unknown>;
  reactivateSfdMutation: UseMutationResult<any, Error, string, unknown>;
  activateSfdMutation: UseMutationResult<any, Error, string, unknown>;
  addSfdMutation: UseMutationResult<any, Error, any, unknown>;
  editSfdMutation: UseMutationResult<any, Error, any, unknown>;
  handleAddSfd: (formData: SfdFormValues) => void;
  handleEditSfd: (formData: SfdFormValues) => void;
}

export function SfdDialogs({
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
  selectedSfd,
  suspendSfdMutation,
  reactivateSfdMutation,
  activateSfdMutation,
  addSfdMutation,
  editSfdMutation,
  handleAddSfd,
  handleEditSfd,
}: SfdDialogsProps) {
  return (
    <>
      <SfdSuspendDialog
        open={showSuspendDialog}
        onOpenChange={setShowSuspendDialog}
        selectedSfd={selectedSfd}
        suspendSfdMutation={suspendSfdMutation}
      />
      
      <SfdReactivateDialog
        open={showReactivateDialog}
        onOpenChange={setShowReactivateDialog}
        selectedSfd={selectedSfd}
        reactivateSfdMutation={reactivateSfdMutation}
      />
      
      <SfdActivateDialog
        open={showActivateDialog}
        onOpenChange={setShowActivateDialog}
        selectedSfd={selectedSfd}
        activateSfdMutation={activateSfdMutation}
      />
      
      <SfdAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddSfd}
        isLoading={addSfdMutation.isPending}
      />
      
      <SfdEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleEditSfd}
        isLoading={editSfdMutation.isPending}
        sfd={selectedSfd}
      />
    </>
  );
}

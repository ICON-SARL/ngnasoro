
import React from 'react';
import { SuspendSfdDialog } from '../sfd/SuspendSfdDialog';
import { ReactivateSfdDialog } from '../sfd/ReactivateSfdDialog';
import { SfdForm } from '../sfd/SfdForm';
import { Sfd } from '../types/sfd-types';
import { SfdFormValues } from '../sfd/schemas/sfdFormSchema';
import { UseMutationResult } from '@tanstack/react-query';

interface SfdDialogsProps {
  showSuspendDialog: boolean;
  setShowSuspendDialog: (show: boolean) => void;
  showReactivateDialog: boolean;
  setShowReactivateDialog: (show: boolean) => void;
  showAddDialog: boolean;
  setShowAddDialog: (show: boolean) => void;
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  selectedSfd: Sfd | null;
  suspendSfdMutation: UseMutationResult<any, Error, string>;
  reactivateSfdMutation: UseMutationResult<any, Error, string>;
  addSfdMutation: UseMutationResult<any, Error, SfdFormValues>;
  editSfdMutation: UseMutationResult<any, Error, { id: string; data: SfdFormValues }>;
  handleAddSfd: (data: SfdFormValues) => void;
  handleEditSfd: (data: SfdFormValues) => void;
}

export function SfdDialogs({
  showSuspendDialog,
  setShowSuspendDialog,
  showReactivateDialog,
  setShowReactivateDialog,
  showAddDialog,
  setShowAddDialog,
  showEditDialog,
  setShowEditDialog,
  selectedSfd,
  suspendSfdMutation,
  reactivateSfdMutation,
  addSfdMutation,
  editSfdMutation,
  handleAddSfd,
  handleEditSfd,
}: SfdDialogsProps) {
  return (
    <>
      <SuspendSfdDialog
        open={showSuspendDialog}
        onOpenChange={setShowSuspendDialog}
        selectedSfd={selectedSfd}
        onConfirm={(sfdId) => suspendSfdMutation.mutate(sfdId)}
        isPending={suspendSfdMutation.isPending}
      />

      <ReactivateSfdDialog
        open={showReactivateDialog}
        onOpenChange={setShowReactivateDialog}
        selectedSfd={selectedSfd}
        onConfirm={(sfdId) => reactivateSfdMutation.mutate(sfdId)}
        isPending={reactivateSfdMutation.isPending}
      />
      
      <SfdForm
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddSfd}
        title="Ajouter une nouvelle SFD"
        isPending={addSfdMutation.isPending}
      />
      
      <SfdForm
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={handleEditSfd}
        initialData={selectedSfd || {}}
        title="Modifier la SFD"
        isPending={editSfdMutation.isPending}
      />
    </>
  );
}


import React from 'react';
import { Sfd } from '../types/sfd-types';
import { SfdFormValues } from '../sfd/schemas/sfdFormSchema';
import { SuspendSfdDialog } from '../sfd/SuspendSfdDialog';
import { ReactivateSfdDialog } from '../sfd/ReactivateSfdDialog';
import { ActivateSfdDialog } from '../sfd/ActivateSfdDialog';
import { SfdAddDialog } from '../sfd/SfdAddDialog';
import { SfdEditDialog } from '../sfd/SfdEditDialog';

interface SfdDialogsProps {
  showSuspendDialog: boolean;
  setShowSuspendDialog: (state: boolean) => void;
  showReactivateDialog: boolean;
  setShowReactivateDialog: (state: boolean) => void;
  showActivateDialog: boolean;
  setShowActivateDialog: (state: boolean) => void;
  showAddDialog: boolean;
  setShowAddDialog: (state: boolean) => void;
  showEditDialog: boolean;
  setShowEditDialog: (state: boolean) => void;
  selectedSfd: Sfd | null;
  suspendSfdMutation: any;
  reactivateSfdMutation: any;
  activateSfdMutation: any;
  addSfdMutation: any;
  editSfdMutation: any;
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
  handleEditSfd
}: SfdDialogsProps) {
  // Handler for suspend action
  const handleConfirmSuspend = () => {
    if (selectedSfd) {
      suspendSfdMutation.mutate(selectedSfd.id);
      setShowSuspendDialog(false);
    }
  };

  // Handler for reactivate action
  const handleConfirmReactivate = () => {
    if (selectedSfd) {
      reactivateSfdMutation.mutate(selectedSfd.id);
      setShowReactivateDialog(false);
    }
  };

  // Handler for activate action
  const handleConfirmActivate = () => {
    if (selectedSfd) {
      activateSfdMutation.mutate(selectedSfd.id);
      setShowActivateDialog(false);
    }
  };

  return (
    <>
      {/* Suspend Dialog */}
      <SuspendSfdDialog
        open={showSuspendDialog}
        onOpenChange={setShowSuspendDialog}
        selectedSfd={selectedSfd}
        onConfirm={(id) => {
          suspendSfdMutation.mutate(id);
          setShowSuspendDialog(false);
        }}
        isPending={suspendSfdMutation.isPending}
      />

      {/* Reactivate Dialog */}
      <ReactivateSfdDialog
        open={showReactivateDialog}
        onOpenChange={setShowReactivateDialog}
        selectedSfd={selectedSfd}
        onConfirm={(id) => {
          reactivateSfdMutation.mutate(id);
          setShowReactivateDialog(false);
        }}
        isPending={reactivateSfdMutation.isPending}
      />

      {/* Activate Dialog */}
      <ActivateSfdDialog
        open={showActivateDialog}
        onOpenChange={setShowActivateDialog}
        sfd={selectedSfd}
        onActivate={handleConfirmActivate}
        isLoading={activateSfdMutation.isPending}
      />

      {/* Add Dialog */}
      <SfdAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      {/* Edit Dialog */}
      {selectedSfd && (
        <SfdEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          sfd={selectedSfd}
          onSubmit={handleEditSfd}
          isLoading={editSfdMutation.isPending}
        />
      )}
    </>
  );
}

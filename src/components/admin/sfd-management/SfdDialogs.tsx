
import React from 'react';
import { Sfd } from '../types/sfd-types';
import { SfdFormValues } from '../sfd/schemas/sfdFormSchema';
import { SuspendSfdDialog } from '../sfd/SuspendSfdDialog';
import { ReactivateSfdDialog } from '../sfd/ReactivateSfdDialog';
import { ActivateSfdDialog } from '../sfd/ActivateSfdDialog';
import { SfdAddDialog } from '../sfd/SfdAddDialog';
import { SfdEditDialog } from '../sfd/SfdEditDialog';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();

  // Handler for suspend action
  const handleConfirmSuspend = () => {
    if (selectedSfd) {
      suspendSfdMutation.mutate(selectedSfd.id);
      setShowSuspendDialog(false);
      // Refresh data after action
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['sfds'] });
      }, 500);
    }
  };

  // Handler for reactivate action
  const handleConfirmReactivate = () => {
    if (selectedSfd) {
      reactivateSfdMutation.mutate(selectedSfd.id);
      setShowReactivateDialog(false);
      // Refresh data after action
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['sfds'] });
      }, 500);
    }
  };

  // Handler for activate action
  const handleConfirmActivate = () => {
    if (selectedSfd) {
      activateSfdMutation.mutate(selectedSfd.id);
      setShowActivateDialog(false);
      // Refresh data after action
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['sfds'] });
      }, 500);
    }
  };

  // Handler for dialog closing with potential data refresh
  const handleDialogChange = (setStateFunction: Function, state: boolean) => {
    setStateFunction(state);
    if (!state) {
      // When dialog closes, refresh data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['sfds'] });
      }, 500);
    }
  };

  return (
    <>
      {/* Suspend Dialog */}
      <SuspendSfdDialog
        open={showSuspendDialog}
        onOpenChange={(state) => handleDialogChange(setShowSuspendDialog, state)}
        selectedSfd={selectedSfd}
        onConfirm={(id) => {
          suspendSfdMutation.mutate(id);
          setShowSuspendDialog(false);
          // Refresh data after action
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['sfds'] });
          }, 500);
        }}
        isPending={suspendSfdMutation.isPending}
      />

      {/* Reactivate Dialog */}
      <ReactivateSfdDialog
        open={showReactivateDialog}
        onOpenChange={(state) => handleDialogChange(setShowReactivateDialog, state)}
        selectedSfd={selectedSfd}
        onConfirm={(id) => {
          reactivateSfdMutation.mutate(id);
          setShowReactivateDialog(false);
          // Refresh data after action
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['sfds'] });
          }, 500);
        }}
        isPending={reactivateSfdMutation.isPending}
      />

      {/* Activate Dialog */}
      <ActivateSfdDialog
        open={showActivateDialog}
        onOpenChange={(state) => handleDialogChange(setShowActivateDialog, state)}
        sfd={selectedSfd}
        onActivate={handleConfirmActivate}
        isLoading={activateSfdMutation.isPending}
      />

      {/* Add Dialog */}
      <SfdAddDialog
        open={showAddDialog}
        onOpenChange={(state) => handleDialogChange(setShowAddDialog, state)}
      />

      {/* Edit Dialog */}
      {selectedSfd && (
        <SfdEditDialog
          open={showEditDialog}
          onOpenChange={(state) => handleDialogChange(setShowEditDialog, state)}
          sfd={selectedSfd}
          onSubmit={handleEditSfd}
          isLoading={editSfdMutation.isPending}
        />
      )}
    </>
  );
}

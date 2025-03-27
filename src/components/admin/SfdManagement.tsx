
import React from 'react';
import { useSfdManagement } from './hooks/useSfdManagement';
import { SfdTable } from './sfd/SfdTable';
import { SuspendSfdDialog } from './sfd/SuspendSfdDialog';
import { ReactivateSfdDialog } from './sfd/ReactivateSfdDialog';

export function SfdManagement() {
  const {
    sfds,
    isLoading,
    isError,
    selectedSfd,
    showSuspendDialog,
    setShowSuspendDialog,
    showReactivateDialog,
    setShowReactivateDialog,
    suspendSfdMutation,
    reactivateSfdMutation,
    handleSuspendSfd,
    handleReactivateSfd
  } = useSfdManagement();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Liste des SFDs ({sfds?.length || 0})
      </h2>
      
      <SfdTable 
        sfds={sfds}
        isLoading={isLoading}
        isError={isError}
        onSuspend={handleSuspendSfd}
        onReactivate={handleReactivateSfd}
      />

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
    </div>
  );
}

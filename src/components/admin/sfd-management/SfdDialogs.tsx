
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { SfdForm } from './SfdForm';

interface SfdDialogsProps {
  showSuspendDialog: boolean;
  setShowSuspendDialog: (show: boolean) => void;
  showReactivateDialog: boolean;
  setShowReactivateDialog: (show: boolean) => void;
  showActivateDialog: boolean;
  setShowActivateDialog: (show: boolean) => void;
  showAddDialog: boolean;
  setShowAddDialog: (show: boolean) => void;
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  selectedSfd: any;
  suspendSfdMutation: any;
  reactivateSfdMutation: any;
  activateSfdMutation: any;
  addSfdMutation: any;
  editSfdMutation: any;
  handleAddSfd: (formData: any) => void;
  handleEditSfd: (formData: any) => void;
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
  return (
    <>
      {/* Suspend Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspendre la SFD</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir suspendre {selectedSfd?.name} ? 
              Cette action empêchera temporairement l'accès à la plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                suspendSfdMutation.mutate(selectedSfd?.id);
                setShowSuspendDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {suspendSfdMutation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Suspendre'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Dialog */}
      <AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réactiver la SFD</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous réactiver {selectedSfd?.name} ?
              Cela rétablira leur accès à la plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                reactivateSfdMutation.mutate(selectedSfd?.id);
                setShowReactivateDialog(false);
              }}
            >
              {reactivateSfdMutation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Réactiver'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate Dialog */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activer la SFD</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous activer {selectedSfd?.name} ?
              Cela leur donnera accès à la plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                activateSfdMutation.mutate(selectedSfd?.id);
                setShowActivateDialog(false);
              }}
            >
              {activateSfdMutation.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Activer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add SFD Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle SFD</DialogTitle>
          </DialogHeader>
          <SfdForm
            onSubmit={handleAddSfd}
            isLoading={addSfdMutation.isLoading}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit SFD Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la SFD</DialogTitle>
          </DialogHeader>
          <SfdForm
            sfd={selectedSfd}
            onSubmit={handleEditSfd}
            isLoading={editSfdMutation.isLoading}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

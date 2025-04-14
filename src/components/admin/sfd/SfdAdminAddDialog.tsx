
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddSfdAdminDialog } from './AddSfdAdminDialog';
import { useAddSfdAdmin } from '../hooks/sfd-admin/useAddSfdAdmin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SfdAdminAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SfdAdminAddDialog({ open, onOpenChange }: SfdAdminAddDialogProps) {
  const [selectedSfdId, setSelectedSfdId] = useState<string>('');
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addSfdAdmin, isAdding, error: addAdminError } = useAddSfdAdmin();

  // Récupérer la liste des SFDs
  const { data: sfds = [], isLoading: isLoadingSfds } = useQuery({
    queryKey: ['sfds-for-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('id, name, code')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: open
  });

  const selectedSfd = sfds.find(sfd => sfd.id === selectedSfdId);

  const handleAddAdmin = (adminData: any) => {
    if (!selectedSfdId) {
      setError("Veuillez sélectionner une SFD d'abord");
      return;
    }

    addSfdAdmin({
      ...adminData,
      sfd_id: selectedSfdId
    });
  };

  const handleContinue = () => {
    if (!selectedSfdId) {
      setError("Veuillez sélectionner une SFD");
      return;
    }

    setError(null);
    setShowAdminDialog(true);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        setSelectedSfdId('');
        setShowAdminDialog(false);
        setError(null);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un administrateur SFD</DialogTitle>
          <DialogDescription>
            Sélectionnez la SFD pour laquelle vous souhaitez créer un administrateur
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!showAdminDialog ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sfd">Sélectionner une SFD</Label>
              <Select
                value={selectedSfdId}
                onValueChange={setSelectedSfdId}
                disabled={isLoadingSfds}
              >
                <SelectTrigger id="sfd">
                  <SelectValue placeholder="Sélectionner une SFD" />
                </SelectTrigger>
                <SelectContent>
                  {sfds.map((sfd) => (
                    <SelectItem key={sfd.id} value={sfd.id}>
                      {sfd.name} ({sfd.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="mr-2"
              >
                Annuler
              </Button>
              <Button onClick={handleContinue}>
                Continuer
              </Button>
            </div>
          </div>
        ) : (
          <AddSfdAdminDialog
            open={showAdminDialog}
            onOpenChange={(open) => {
              if (!open) {
                setShowAdminDialog(false);
                onOpenChange(false);
              }
            }}
            sfdId={selectedSfdId}
            sfdName={selectedSfd?.name || ''}
            onAddAdmin={handleAddAdmin}
            isLoading={isAdding}
            error={addAdminError}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

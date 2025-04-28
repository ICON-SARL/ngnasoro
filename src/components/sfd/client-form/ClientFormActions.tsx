
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ClientFormActionsProps {
  isSubmitting: boolean;
  onReset: () => void;
}

export function ClientFormActions({ isSubmitting, onReset }: ClientFormActionsProps) {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onReset} disabled={isSubmitting}>
        Annuler
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Création en cours...
          </>
        ) : (
          'Créer le client'
        )}
      </Button>
    </div>
  );
}

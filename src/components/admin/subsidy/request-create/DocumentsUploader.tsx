
import React from 'react';
import { Label } from '@/components/ui/label';
import { PaperclipIcon } from 'lucide-react';

export function DocumentsUploader() {
  return (
    <div>
      <Label>Documents justificatifs (optionnel)</Label>
      <div className="mt-2 border-2 border-dashed border-gray-200 rounded-md p-8 text-center">
        <PaperclipIcon className="h-8 w-8 mx-auto text-gray-400" />
        <p className="mt-2 text-sm text-muted-foreground">
          Fonctionnalité de téléchargement de documents en cours d'implémentation
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Format supportés : PDF, DOCX, XLSX, JPG, PNG (max. 10MB)
        </p>
      </div>
    </div>
  );
}

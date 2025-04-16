
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DocumentPreviewProps {
  documentUrl?: string;
  documentType: 'id_card' | 'selfie';
  isVerifying?: boolean;
}

export function DocumentPreview({ documentUrl, documentType, isVerifying = false }: DocumentPreviewProps) {
  if (!documentUrl) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Document manquant</AlertTitle>
        <AlertDescription>
          {documentType === 'id_card' ? 
            'La pièce d\'identité n\'a pas été téléchargée.' : 
            'Le selfie n\'a pas été téléchargé.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={isVerifying ? 'border-yellow-300' : ''}>
      <CardHeader>
        <CardTitle className="text-sm">
          {documentType === 'id_card' ? 'Pièce d\'identité' : 'Selfie'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={documentUrl}
            alt={documentType === 'id_card' ? 'Pièce d\'identité' : 'Selfie'}
            className="object-cover w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}

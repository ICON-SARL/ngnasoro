
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { SfdClient, Loan } from '@/types/sfdClients';

interface ClientAlertsProps {
  client: SfdClient;
  loans?: Loan[];
  documents?: Array<{
    document_type: string;
    expires_at?: string;
  }>;
}

export function ClientAlerts({ client, loans, documents }: ClientAlertsProps) {
  const overdueLoans = loans?.filter(loan => {
    if (!loan.next_payment_date) return false;
    return new Date(loan.next_payment_date) < new Date();
  });

  const expiredDocuments = documents?.filter(doc => {
    if (!doc.expires_at) return false;
    return new Date(doc.expires_at) < new Date();
  });

  if (!overdueLoans?.length && !expiredDocuments?.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      {overdueLoans?.map(loan => (
        <Alert key={loan.id} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Prêt en retard</AlertTitle>
          <AlertDescription>
            Le paiement du prêt #{loan.reference || loan.id.substring(0, 8)} était dû le{' '}
            {new Date(loan.next_payment_date!).toLocaleDateString('fr-FR')}
          </AlertDescription>
        </Alert>
      ))}

      {expiredDocuments?.map(doc => (
        <Alert key={doc.document_type} variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Document expiré</AlertTitle>
          <AlertDescription>
            Le document {doc.document_type} a expiré le{' '}
            {new Date(doc.expires_at!).toLocaleDateString('fr-FR')}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

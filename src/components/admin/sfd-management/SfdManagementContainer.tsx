
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function SfdManagementContainer() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des SFDs</h1>
      <p className="text-muted-foreground mb-6">
        Administrez les institutions de microfinance partenaires et leurs comptes administrateurs
      </p>
      
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2">Recommandations techniques</h3>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Transactions SQL atomiques :</strong> Utiliser des transactions SQL pour garantir l'intégrité des données.
              <pre className="bg-gray-50 p-2 rounded mt-1 text-sm font-mono">
                BEGIN;<br/>
                UPDATE sfd_operation SET balance = balance - 100 WHERE sfd_id = 123;<br/>
                UPDATE client_loan SET balance = balance + 100 WHERE client_id = 456;<br/>
                COMMIT;
              </pre>
            </li>
            <li>
              <strong>Verrous optimistes :</strong> Implémenter des mécanismes de versioning pour éviter les conflits de concurrence.
            </li>
            <li>
              <strong>Logs d'audit :</strong> Stocker toutes les tentatives de transaction dans transaction_audit_logs.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

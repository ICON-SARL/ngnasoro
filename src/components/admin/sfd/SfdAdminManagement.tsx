
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SfdAdminAddDialog } from './SfdAdminAddDialog';
import { Button } from '@/components/ui/button';
import { UserPlus, Shield } from 'lucide-react';
import { useState } from 'react';

export function SfdAdminManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gestion des Administrateurs SFD</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Nouvel Administrateur SFD
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Gestion des Administrateurs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Gérez les administrateurs pour chaque SFD. Les administrateurs peuvent :
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Gérer les clients de leur SFD</li>
              <li>Approuver les demandes de prêt</li>
              <li>Consulter les statistiques</li>
              <li>Gérer les comptes et les transactions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <SfdAdminAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}

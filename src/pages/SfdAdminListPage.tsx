
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/auth/usePermissions';

const SfdAdminListPage = () => {
  const { isSuperAdmin } = usePermissions();

  if (!isSuperAdmin) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Accès non autorisé</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des Administrateurs SFD</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des Administrateurs SFD</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Fonctionnalité en cours d'implémentation.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdAdminListPage;

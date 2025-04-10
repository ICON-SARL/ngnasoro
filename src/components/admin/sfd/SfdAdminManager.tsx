
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useSfdAdminManagement } from '@/components/admin/hooks/sfd-admin';
import { AddSfdAdminDialog } from '@/components/admin/sfd/AddSfdAdminDialog';
import { SfdAdminList } from '@/components/admin/sfd/SfdAdminList';
import { Plus, Loader2, RefreshCw } from 'lucide-react';

interface SfdAdminManagerProps {
  sfdId: string;
  sfdName: string;
}

export function SfdAdminManager({ sfdId, sfdName }: SfdAdminManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { isLoading, error, addSfdAdmin, refetchAdmins } = useSfdAdminManagement();

  const handleAddAdmin = (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    sfd_id: string;
    notify: boolean;
  }) => {
    addSfdAdmin(data, {
      onSuccess: () => {
        setShowAddDialog(false);
        refetchAdmins();
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Administrateurs SFD</CardTitle>
          <CardDescription>Gérer les administrateurs de {sfdName}</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetchAdmins()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => setShowAddDialog(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un administrateur
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <SfdAdminList sfdId={sfdId} />
        <AddSfdAdminDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          sfdId={sfdId}
          sfdName={sfdName}
          onAddAdmin={handleAddAdmin}
          isLoading={isLoading}
          error={error}
        />
      </CardContent>
    </Card>
  );
}

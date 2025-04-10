
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useSfdAdminManagement } from '@/hooks/useSfdAdminManagement';
import { AddSfdAdminDialog } from '@/components/admin/sfd/AddSfdAdminDialog';
import { Plus, Loader2 } from 'lucide-react';

interface SfdAdminManagerProps {
  sfdId: string;
  sfdName: string;
}

export function SfdAdminManager({ sfdId, sfdName }: SfdAdminManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { isLoading, error, addSfdAdmin } = useSfdAdminManagement();

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
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Administrateurs SFD</CardTitle>
          <CardDescription>Gérer les administrateurs de la SFD</CardDescription>
        </div>
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
      </CardHeader>
      <CardContent>
        {/* Admin list would go here */}
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

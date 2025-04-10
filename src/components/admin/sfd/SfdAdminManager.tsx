
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAddSfdAdmin } from '@/components/admin/hooks/sfd-admin/useAddSfdAdmin';
import { AddSfdAdminDialog } from '@/components/admin/sfd/AddSfdAdminDialog';
import { SfdAdminList } from '@/components/admin/sfd/SfdAdminList';
import { Plus, Loader2, RefreshCw } from 'lucide-react';
import { useSfdAdminsList } from '../hooks/sfd-admin/useSfdAdminsList';

interface SfdAdminManagerProps {
  sfdId: string;
  sfdName: string;
}

export function SfdAdminManager({ sfdId, sfdName }: SfdAdminManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { 
    sfdAdmins, 
    isLoading: isLoadingAdmins, 
    error: adminsError,
    refetch: refetchAdmins 
  } = useSfdAdminsList(sfdId);
  
  const { 
    addSfdAdmin, 
    isAdding, 
    error: addError 
  } = useAddSfdAdmin();

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
            disabled={isLoadingAdmins || isAdding}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => setShowAddDialog(true)}
            disabled={isLoadingAdmins || isAdding}
          >
            {isAdding ? (
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
        <SfdAdminList 
          sfdId={sfdId} 
          sfdName={sfdName}
          onAddAdmin={() => setShowAddDialog(true)} 
        />
        
        <AddSfdAdminDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          sfdId={sfdId}
          sfdName={sfdName}
          onAddAdmin={handleAddAdmin}
          isLoading={isAdding}
          error={addError}
        />
      </CardContent>
    </Card>
  );
}

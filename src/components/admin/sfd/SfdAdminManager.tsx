
import React, { useState } from 'react';
import { SfdAdminList } from './SfdAdminList';
import { Button } from '@/components/ui/button';
import { SfdAdminAssociationDialog } from './SfdAdminAssociationDialog';
import { UserPlus } from 'lucide-react';

interface SfdAdminManagerProps {
  sfdId: string;
  sfdName: string;
}

export function SfdAdminManager({ sfdId, sfdName }: SfdAdminManagerProps) {
  const [showAssociationDialog, setShowAssociationDialog] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Administrateurs de la SFD</h3>
        <Button onClick={() => setShowAssociationDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Associer un administrateur
        </Button>
      </div>
      
      <SfdAdminList 
        sfdId={sfdId} 
        sfdName={sfdName} 
        onAddAdmin={() => setShowAssociationDialog(true)} 
      />
      
      <SfdAdminAssociationDialog
        open={showAssociationDialog}
        onOpenChange={setShowAssociationDialog}
        onSuccess={() => console.log('Admin associated successfully')}
        sfdId={sfdId}
        sfdName={sfdName}
      />
    </div>
  );
}

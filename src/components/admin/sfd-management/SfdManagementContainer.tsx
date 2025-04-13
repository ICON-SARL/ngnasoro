
import React, { useState } from 'react';
import { SfdManagementStats } from './SfdManagementStats';
import { SfdAddDialog } from './SfdAddDialog';
import { Button } from '@/components/ui/button';
import { Building, Plus } from 'lucide-react';

export const SfdManagementContainer = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium mb-2">Statistiques des SFDs</h3>
        <Button 
          onClick={() => setAddDialogOpen(true)}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <Building className="h-4 w-4" />
          Ajouter une SFD
        </Button>
      </div>
      
      <SfdManagementStats />
      
      <SfdAddDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
    </div>
  );
};

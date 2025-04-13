
import React, { useState, useEffect } from 'react';
import { SfdManagementStats } from './SfdManagementStats';
import { SfdAddDialog } from './SfdAddDialog';
import { Button } from '@/components/ui/button';
import { Building, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SfdManagementContainer = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Check for any ongoing operations in sessionStorage
  useEffect(() => {
    const ongoingOperation = sessionStorage.getItem('sfd_creation_in_progress');
    if (ongoingOperation) {
      sessionStorage.removeItem('sfd_creation_in_progress');
      toast({
        title: 'Opération précédente interrompue',
        description: 'Une opération de création de SFD précédente a été interrompue. Vous pouvez réessayer.',
        variant: 'destructive', // Changed from 'warning' to 'destructive' since 'warning' is not an allowed variant
      });
    }
  }, []);
  
  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };
  
  const handleDialogChange = (open: boolean) => {
    setAddDialogOpen(open);
    
    // If dialog is being opened, store operation state
    if (open) {
      sessionStorage.setItem('sfd_creation_in_progress', 'true');
    } else {
      // If dialog is being closed, clear operation state
      sessionStorage.removeItem('sfd_creation_in_progress');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium mb-2">Statistiques des SFDs</h3>
        <Button 
          onClick={handleOpenAddDialog}
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
        onOpenChange={handleDialogChange} 
      />
    </div>
  );
};

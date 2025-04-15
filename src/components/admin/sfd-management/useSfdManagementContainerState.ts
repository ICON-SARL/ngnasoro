
import { useState } from 'react';
import { useSfdAdminManagement } from '@/hooks/useSfdAdminManagement';
import { useSfdData } from '@/components/admin/hooks/sfd-management/useSfdData';

export function useSfdManagementContainerState() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSfdId, setSelectedSfdId] = useState('');
  const { sfds, isLoading: isLoadingSfds } = useSfdData();
  const { createSfdAdmin, isLoading, error: adminCreationError } = useSfdAdminManagement();
  const [error, setError] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSelectSfd = (sfdId: string) => {
    setSelectedSfdId(sfdId);
  };

  const handleAddAdmin = async (adminData: any) => {
    try {
      setError(null);
      const success = await createSfdAdmin(adminData.email, adminData.sfd_id);
      
      if (success) {
        handleCloseDialog();
        return true;
      } else {
        setError(adminCreationError || "Impossible de créer l'administrateur SFD");
        return false;
      }
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite");
      return false;
    }
  };

  return {
    isDialogOpen,
    selectedSfdId,
    sfds,
    isLoadingSfds,
    isLoading,
    error,
    handleOpenDialog,
    handleCloseDialog,
    handleSelectSfd,
    handleAddAdmin
  };
}

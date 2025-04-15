
import { useState } from 'react';
import { useSfdData } from '@/components/admin/hooks/sfd-management/useSfdData';

export function useSfdManagementContainerState() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSfdId, setSelectedSfdId] = useState('');
  const { sfds, isLoading: isLoadingSfds } = useSfdData();

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSelectSfd = (sfdId: string) => {
    setSelectedSfdId(sfdId);
  };

  return {
    isDialogOpen,
    selectedSfdId,
    sfds,
    isLoadingSfds,
    handleOpenDialog,
    handleCloseDialog,
    handleSelectSfd,
  };
}

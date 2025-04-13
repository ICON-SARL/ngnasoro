
import { useEffect } from 'react';
import { useSfdDataAccessCore } from './sfd/useSfdDataAccessCore';
export type { SfdData } from './sfd/types';

export function useSfdDataAccess() {
  const {
    activeSfdId, 
    sfdData, 
    isLoading, 
    error, 
    setActiveSfd,
    setActiveSfdId,
    switchActiveSfd,
    getActiveSfdData,
    associateUserWithSfd
  } = useSfdDataAccessCore();

  // Log the available SFDs for debugging
  useEffect(() => {
    if (sfdData.length > 0) {
      console.log('Available SFDs:', sfdData);
    }
  }, [sfdData]);

  return {
    activeSfdId,
    sfdData,
    isLoading,
    error,
    setActiveSfd,
    setActiveSfdId,
    switchActiveSfd,
    getActiveSfdData,
    associateUserWithSfd
  };
}

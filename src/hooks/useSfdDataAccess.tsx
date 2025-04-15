
import { useSfdDataAccess as useOriginalSfdDataAccess } from './useSfdDataAccess.ts';
// Use export type for TypeScript types when isolatedModules is enabled
export type { SfdData } from './sfd/types';

export function useSfdDataAccess() {
  const { 
    activeSfdId, 
    sfdData, 
    isLoading, 
    error, 
    setActiveSfd,
    // Add the missing properties and methods that are causing errors
    setActiveSfdId,
    switchActiveSfd,
    getActiveSfdData,
    associateUserWithSfd
  } = useOriginalSfdDataAccess();

  return {
    activeSfdId,
    sfdData,
    isLoading,
    error,
    setActiveSfd,
    // Export the missing properties and methods
    setActiveSfdId,
    switchActiveSfd,
    getActiveSfdData,
    associateUserWithSfd
  };
}


import { useSfdDataAccess as useOriginalSfdDataAccess } from './useSfdDataAccess';
// Use export type for TypeScript types when isolatedModules is enabled
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
  } = useOriginalSfdDataAccess();

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

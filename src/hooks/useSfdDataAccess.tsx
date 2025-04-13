
import { useSfdDataAccess as useOriginalSfdDataAccess } from './useSfdDataAccess.ts';
// Use export type for TypeScript types when isolatedModules is enabled
export type { SfdData } from './useSfdDataAccess.ts';

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

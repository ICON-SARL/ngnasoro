
import { useSfdDataAccessCore } from './sfd/useSfdDataAccessCore';
// Use export type for TypeScript types when isolatedModules is enabled
export type { SfdData } from './sfd/types';

export function useSfdDataAccess() {
  return useSfdDataAccessCore();
}

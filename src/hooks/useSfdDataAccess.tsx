
import { useSfdDataAccess as useOriginalSfdDataAccess } from './useSfdDataAccess.ts';
// Use export type for TypeScript types when isolatedModules is enabled
export type { SfdData } from './useSfdDataAccess.ts';

export function useSfdDataAccess() {
  return useOriginalSfdDataAccess();
}

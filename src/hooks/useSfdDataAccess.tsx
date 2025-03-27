
import { useSfdDataAccessCore } from './sfd/useSfdDataAccessCore';
export { SfdData } from './sfd/types';

export function useSfdDataAccess() {
  return useSfdDataAccessCore();
}

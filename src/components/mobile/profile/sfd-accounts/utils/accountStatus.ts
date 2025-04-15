
import { SfdAccountDisplay } from '../types/SfdAccountTypes';

export type AccountStatus = 'active' | 'default' | 'inactive' | 'pending';

export const getAccountStatus = (account: SfdAccountDisplay): AccountStatus => {
  if (!account) return 'inactive';
  
  if (account.isDefault) return 'default';
  return 'active';
};

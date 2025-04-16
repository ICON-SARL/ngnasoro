
import { SfdAccountDisplay } from '../types/SfdAccountTypes';

export type AccountStatus = 'active' | 'verified' | 'pending' | 'inactive';

/**
 * Determines the account status from the SFD account data
 */
export function getAccountStatus(account: SfdAccountDisplay): AccountStatus {
  if (account.is_default) {
    return 'active';
  }
  
  if (account.isVerified) {
    return 'verified';
  }
  
  if (account.status === 'pending') {
    return 'pending';
  }
  
  return 'inactive';
}

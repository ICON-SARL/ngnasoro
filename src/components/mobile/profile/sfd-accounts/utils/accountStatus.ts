
import { SfdAccountDisplay } from '../types/SfdAccountTypes';

// Define the possible account status values for UI display
export type AccountStatus = 'active' | 'pending' | 'inactive' | 'error';

// Get the appropriate account status for display
export function getAccountStatus(account: SfdAccountDisplay): AccountStatus {
  if (!account.status) {
    return 'error';
  }
  
  switch (account.status.toLowerCase()) {
    case 'active':
      return 'active';
    case 'pending':
    case 'validating':
    case 'awaiting_validation':
      return 'pending';
    case 'inactive':
    case 'suspended':
    case 'disabled':
      return 'inactive';
    default:
      return 'error';
  }
}

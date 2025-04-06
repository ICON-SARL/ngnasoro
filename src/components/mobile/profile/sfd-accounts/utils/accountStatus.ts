
import { SfdAccountDisplay } from '../types/SfdAccountTypes';

/**
 * Determines the status of an SFD account
 */
export function getAccountStatus(sfd: SfdAccountDisplay): 'verified' | 'pending' {
  if (sfd.isVerified !== undefined) {
    return sfd.isVerified ? 'verified' : 'pending';
  }
  // Fallback to legacy logic if isVerified is not defined
  return sfd.id.startsWith('1') ? 'pending' : 'verified';
}


import { SfdAccountDisplay } from "../types/SfdAccountTypes";

export function getAccountStatus(account: SfdAccountDisplay): 'verified' | 'pending' {
  // Si la propriété isVerified est explicitement définie, l'utiliser
  if (typeof account.isVerified === 'boolean') {
    return account.isVerified ? 'verified' : 'pending';
  }
  
  // Sinon, on suppose que le compte est vérifié par défaut (comportement existant)
  return 'verified';
}

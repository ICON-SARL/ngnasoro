
import { SfdAccountDisplay } from '../types/SfdAccountTypes';

/**
 * Sorts accounts to match the image order: Deuxième, Troisième, Premier
 */
export function sortAccounts(accounts: SfdAccountDisplay[]): SfdAccountDisplay[] {
  return [...accounts].sort((a, b) => {
    if (a.name === 'Deuxième SFD') return -1;
    if (b.name === 'Deuxième SFD') return 1;
    if (a.name === 'Troisième SFD') return -1;
    if (b.name === 'Troisième SFD') return 1;
    if (a.name === 'Premier SFD') return 1;
    if (b.name === 'Premier SFD') return -1;
    return 0;
  });
}

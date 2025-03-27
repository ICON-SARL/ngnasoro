
import { Transaction, DatabaseTransactionRecord } from '@/types/transactions';

/**
 * Converts database records to the Transaction interface format
 */
export function convertDatabaseRecordsToTransactions(
  records: DatabaseTransactionRecord[], 
  sfdId?: string
): Transaction[] {
  return records.map(record => ({
    id: record.id,
    user_id: record.user_id,
    sfd_id: record.sfd_id || sfdId,
    type: convertTransactionType(record.type),
    amount: record.amount,
    status: 'success',
    created_at: record.created_at || new Date().toISOString(),
    date: record.date || record.created_at,
    name: record.name,
    avatar_url: record.avatar_url
  }));
}

/**
 * Converts various transaction type strings to standardized types
 */
function convertTransactionType(type: string): Transaction['type'] {
  const typeMap: Record<string, Transaction['type']> = {
    'deposit': 'deposit',
    'withdrawal': 'withdrawal',
    'versement': 'deposit',
    'retrait': 'withdrawal',
    'transfert': 'transfer',
    'transfer': 'transfer',
    'payment': 'payment',
    'paiement': 'payment',
    'loan_disbursement': 'loan_disbursement',
    'remboursement': 'payment'
  };

  return typeMap[type.toLowerCase()] || 'other';
}

/**
 * Generates mock transactions for testing purposes
 */
export function generateMockTransactions(sfdId: string): Transaction[] {
  const types: Transaction['type'][] = ['deposit', 'withdrawal', 'transfer', 'payment'];
  const names = ['Transfert vers Amadou', 'Versement épargne', 'Retrait', 'Paiement de prêt'];
  
  return Array.from({ length: 10 }, (_, i) => {
    const type = types[i % types.length];
    const isIncoming = type === 'deposit' || (type === 'transfer' && i % 2 === 0);
    
    return {
      id: `tx-${Date.now()}-${i}`,
      user_id: 'mock-user',
      sfd_id: sfdId,
      type: type,
      amount: isIncoming ? 25000 + (i * 5000) : -(15000 + (i * 2500)),
      status: 'success',
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
      date: new Date(Date.now() - i * 86400000).toISOString(),
      name: names[i % names.length],
      description: `Transaction ${i + 1}`,
      avatar_url: null
    };
  });
}

/**
 * Format currency amount for display
 */
export function formatCurrencyAmount(amount: number, currency: string = 'FCFA'): string {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return `${formatter.format(Math.abs(amount))} ${currency}`;
}

/**
 * Format transaction amount for display with + or - prefix
 */
export function formatTransactionAmount(amount: number, currency: string = 'FCFA'): string {
  const formatted = formatCurrencyAmount(amount, currency);
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}

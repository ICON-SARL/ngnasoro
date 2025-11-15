
/**
 * Format a currency amount as a string with FCFA
 */
export function formatCurrencyAmount(amount: number | undefined, currency: string = 'FCFA'): string {
  if (amount === undefined) return '0';
  return new Intl.NumberFormat('fr-FR').format(amount);
}

/**
 * Get an appropriate color for a transaction type
 */
export function getTransactionTypeColor(type: string): string {
  switch(type) {
    case 'deposit': 
      return 'text-green-600';
    case 'withdrawal':
      return 'text-red-600';
    case 'transfer':
      return 'text-blue-600';
    case 'loan_repayment':
      return 'text-purple-600';
    case 'loan_disbursement':
      return 'text-emerald-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get an appropriate background color for a transaction type
 */
export function getTransactionTypeBgColor(type: string): string {
  switch(type) {
    case 'deposit': 
      return 'bg-green-100';
    case 'withdrawal':
      return 'bg-red-100';
    case 'transfer':
      return 'bg-blue-100';
    case 'loan_repayment':
      return 'bg-purple-100';
    case 'loan_disbursement':
      return 'bg-emerald-100';
    default:
      return 'bg-gray-100';
  }
}

/**
 * Get a sign (+ or -) based on transaction type
 */
export function getTransactionSign(type: string): string {
  switch(type) {
    case 'deposit':
    case 'loan_disbursement':
      return '+';
    case 'withdrawal':
    case 'loan_repayment':
    case 'transfer':
      return '-';
    default:
      return '';
  }
}

/**
 * Format transaction amount with appropriate sign and currency
 */
export function formatTransactionAmount(amount: number, type?: string): string {
  const sign = type ? getTransactionSign(type) : (amount >= 0 ? '+' : '');
  return `${sign}${formatCurrencyAmount(Math.abs(amount))}`;
}

/**
 * Convert database records to Transaction type
 */
export function convertDatabaseRecordsToTransactions(records: any[], sfdId?: string): any[] {
  if (!records || !Array.isArray(records)) return [];
  
  return records.map(record => {
    // Return a normalized transaction object
    return {
      id: record.id,
    name: record.name || record.description || (record.type === 'deposit' ? 'Dépôt' : 
                     record.type === 'withdrawal' ? 'Retrait' : 
                     record.type === 'loan_repayment' ? 'Remboursement de prêt' : 
                     record.type === 'loan_disbursement' ? 'Décaissement de prêt' : 'Transaction'),
      type: ensureValidTransactionType(record.type),
      amount: record.amount,
      date: record.date || record.created_at,
      status: record.status || 'success',
      description: record.description,
      reference: record.reference || record.reference_id,
      reference_id: record.reference_id || record.reference,
      created_at: record.created_at,
      user_id: record.user_id,
      sfd_id: record.sfd_id || sfdId,
      avatar_url: record.avatar_url || null,
      payment_method: record.payment_method
    };
  });
}

/**
 * Ensure that a transaction type is valid
 */
export function ensureValidTransactionType(type: string): string {
  const validTypes = [
    'deposit', 
    'withdrawal', 
    'transfer', 
    'payment', 
    'loan_repayment', 
    'loan_disbursement',
    'reversal',
    'other'
  ];
  
  return validTypes.includes(type) ? type : 'other';
}

/**
 * Generate mock transactions for testing
 */
export function generateMockTransactions(sfdId: string, count: number = 10): any[] {
  const types = ['deposit', 'withdrawal', 'loan_repayment', 'loan_disbursement'];
  const names = ['Dépôt mensuel', 'Retrait ATM', 'Remboursement', 'Décaissement', 'Transfert'];
  
  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = type === 'deposit' || type === 'loan_disbursement' ? 
      Math.floor(Math.random() * 500000) + 10000 : 
      -(Math.floor(Math.random() * 300000) + 5000);
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    return {
      id: `mock-${i}-${Date.now()}`,
      name: names[Math.floor(Math.random() * names.length)],
      type,
      amount,
      date: date.toISOString(),
      status: 'success',
      description: `Transaction ${type} générée pour test`,
      reference_id: `ref-${Date.now()}-${i}`,
      created_at: date.toISOString(),
      user_id: 'mock-user',
      sfd_id: sfdId,
      avatar_url: null
    };
  });
}

/**
 * Convert an ID of any type to a string safely
 */
export function safeIdToString(id: string | number | undefined): string {
  if (id === undefined || id === null) return '';
  return id.toString();
}

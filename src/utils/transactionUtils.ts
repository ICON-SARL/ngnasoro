
/**
 * Formats a number as currency amount
 * @param amount Number to format
 * @param prefix Currency prefix (e.g. "$")
 * @returns Formatted amount string
 */
export const formatCurrencyAmount = (amount: number, prefix: string = ""): string => {
  if (amount === undefined || amount === null) return `${prefix}0`;
  
  return `${prefix}${amount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

/**
 * Gets a color for a transaction type
 * @param type Transaction type
 * @returns CSS color class
 */
export const getTransactionTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'deposit':
    case 'loan_disbursement':
      return 'text-green-600';
    case 'withdrawal':
    case 'loan_repayment':
      return 'text-red-600';
    case 'transfer':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * Gets a label for a transaction type
 * @param type Transaction type
 * @returns Human-readable label
 */
export const getTransactionTypeLabel = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'deposit':
      return 'Dépôt';
    case 'withdrawal':
      return 'Retrait';
    case 'loan_disbursement':
      return 'Décaissement prêt';
    case 'loan_repayment':
      return 'Remboursement prêt';
    case 'transfer':
      return 'Transfert';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

/**
 * Formats a transaction amount with currency and sign
 * @param amount Amount to format
 * @param currency Currency symbol (default: "FCFA")
 * @returns Formatted amount
 */
export const formatTransactionAmount = (amount: number, currency: string = "FCFA"): string => {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${formatCurrencyAmount(amount)} ${currency}`;
};

/**
 * Converts database transaction records to Transaction objects
 * @param records Database records
 * @param sfdId Optional SFD ID to assign to transactions
 * @returns Array of Transaction objects
 */
export const convertDatabaseRecordsToTransactions = (records: any[], sfdId?: string): any[] => {
  if (!records || !Array.isArray(records)) return [];
  
  return records.map(record => ({
    id: record.id,
    user_id: record.user_id,
    sfd_id: record.sfd_id || sfdId,
    type: record.type || 'other',
    amount: record.amount || 0,
    status: record.status || 'success',
    created_at: record.created_at || record.date || new Date().toISOString(),
    updated_at: record.updated_at,
    description: record.description || `Transaction pour ${record.name || 'client'}`,
    name: record.name || 'Transaction',
    date: record.date || record.created_at,
    avatar_url: record.avatar_url,
    currency: record.currency || 'FCFA',
    client_id: record.client_id,
    reference_id: record.reference_id,
    payment_method: record.payment_method
  }));
};

/**
 * Generates mock transactions for testing
 * @param sfdId SFD ID to assign to transactions
 * @param count Number of transactions to generate (default: 5)
 * @returns Array of mock Transaction objects
 */
export const generateMockTransactions = (sfdId: string, count: number = 5): any[] => {
  const mockTransactions = [];
  const types = ['deposit', 'withdrawal', 'loan_disbursement', 'loan_repayment', 'transfer'];
  const names = ['Amadou Diallo', 'Fatoumata Bah', 'Ousmane Sow', 'Aicha Diop', 'Ibrahim Camara'];
  
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const isPositive = type === 'deposit' || type === 'loan_disbursement';
    const amount = (Math.floor(Math.random() * 50) + 1) * 5000 * (isPositive ? 1 : -1);
    
    // Create date from 0-30 days ago
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    mockTransactions.push({
      id: `mock-${i}-${Date.now()}`,
      user_id: `user-${i}`,
      sfd_id: sfdId,
      type: type,
      amount: Math.abs(amount),
      status: 'success',
      created_at: date.toISOString(),
      name: `${isPositive ? 'Dépôt' : 'Retrait'} de ${names[i % names.length]}`,
      description: `${getTransactionTypeLabel(type)} - ${names[i % names.length]}`,
      date: date.toISOString()
    });
  }
  
  // Sort by date, most recent first
  return mockTransactions.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

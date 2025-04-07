
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
 * Converts database transaction records to the Transaction type
 * @param records Database records to convert
 * @param sfdId Optional SFD ID to associate with transactions
 * @returns Array of Transaction objects
 */
export const convertDatabaseRecordsToTransactions = (records: any[], sfdId?: string): any[] => {
  return records.map(record => ({
    id: record.id,
    user_id: record.user_id,
    sfd_id: record.sfd_id || sfdId,
    client_id: record.client_id,
    type: record.type,
    amount: record.amount,
    currency: record.currency || 'FCFA',
    status: record.status || 'success',
    description: record.description || `Transaction for ${record.name || 'client'}`,
    metadata: record.metadata,
    payment_method: record.payment_method,
    reference_id: record.reference_id,
    created_at: record.created_at || record.date || new Date().toISOString(),
    updated_at: record.updated_at,
    date: record.date,
    name: record.name,
    avatar_url: record.avatar_url
  }));
};

/**
 * Generates mock transactions for testing/demo purposes
 * @param sfdId SFD ID to associate with transactions
 * @returns Array of mock Transaction objects
 */
export const generateMockTransactions = (sfdId: string): any[] => {
  const mockTransactions = [];
  const types = ['deposit', 'withdrawal', 'transfer', 'loan_disbursement', 'loan_repayment'];
  const names = ['Amadou Diallo', 'Fatou Sow', 'Ibrahim Keita', 'Aïcha Camara', 'Moussa Traoré'];
  
  // Generate 10 random transactions
  for (let i = 0; i < 10; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const amount = Math.floor(Math.random() * 500000) + 10000; // Random amount between 10,000 and 510,000
    const daysAgo = Math.floor(Math.random() * 30); // Random date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    mockTransactions.push({
      id: `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      user_id: `USER-${i}`,
      sfd_id: sfdId,
      type,
      amount,
      currency: 'FCFA',
      status: Math.random() > 0.9 ? 'pending' : 'success',
      description: `${type === 'deposit' ? 'Dépôt' : type === 'withdrawal' ? 'Retrait' : 'Transaction'} par ${name}`,
      created_at: date.toISOString(),
      date: date.toISOString(),
      name,
      avatar_url: null
    });
  }
  
  return mockTransactions;
};

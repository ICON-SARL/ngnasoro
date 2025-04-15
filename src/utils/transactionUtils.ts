
export const formatCurrencyAmount = (amount: number, includeSymbol = true): string => {
  const formattedNumber = Math.abs(amount).toLocaleString('fr-FR');
  return includeSymbol ? `${formattedNumber} FCFA` : formattedNumber;
};

export const formatTransactionAmount = (amount: number, type?: string): string => {
  const formattedAmount = formatCurrencyAmount(Math.abs(amount));
  return type === 'deposit' || type === 'loan_disbursement' ? 
    `+${formattedAmount}` : 
    `-${formattedAmount}`;
};

export const getTransactionType = (transaction: { type: string; amount: number }): 'deposit' | 'withdrawal' => {
  if (transaction.type === 'deposit' || transaction.type === 'loan_disbursement' || transaction.amount > 0) {
    return 'deposit';
  }
  return 'withdrawal';
};

// Helper function to safely convert different ID types to string
export const safeIdToString = (id: string | number): string => {
  if (typeof id === 'number') {
    return id.toString();
  }
  return id;
};

// This ensures the transaction type conforms to the allowed types in the Transaction interface
export const ensureValidTransactionType = (type: string): Transaction['type'] => {
  const validTypes: Transaction['type'][] = [
    'deposit', 'withdrawal', 'transfer', 'payment', 
    'loan_repayment', 'loan_disbursement', 'reversal', 'other'
  ];
  
  if (validTypes.includes(type as any)) {
    return type as Transaction['type'];
  }
  
  // Map similar types or default to 'other'
  if (type.includes('deposit')) return 'deposit';
  if (type.includes('withdraw')) return 'withdrawal';
  if (type.includes('transfer')) return 'transfer';
  if (type.includes('payment')) return 'payment';
  if (type.includes('repayment')) return 'loan_repayment';
  if (type.includes('disburse')) return 'loan_disbursement';
  if (type.includes('reverse')) return 'reversal';
  
  return 'other';
};

// Helper function to convert database records to Transaction objects
export const convertDatabaseRecordsToTransactions = (
  records: any[],
  sfdId?: string
): Transaction[] => {
  return records.map(record => {
    // Make sure all fields match the Transaction type
    const transaction: Transaction = {
      id: record.id,
      name: record.name || 'Transaction',
      type: ensureValidTransactionType(record.type),
      amount: Number(record.amount),
      date: record.date || record.created_at,
      status: record.status as any || 'success',
      description: record.description,
      category: record.category,
      reference: record.reference,
      reference_id: record.reference_id,
      avatar: record.avatar,
      avatar_url: record.avatar_url,
      payment_method: record.payment_method,
      created_at: record.created_at,
      user_id: record.user_id,
      sfd_id: record.sfd_id || sfdId,
      metadata: record.metadata || {},
      affects_balance: record.affects_balance !== false
    };
    return transaction;
  });
};

// Generate mock transaction data for development and testing
export const generateMockTransactions = (sfdId?: string): Transaction[] => {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      name: 'Dépôt mensuel',
      type: 'deposit',
      amount: 50000,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      payment_method: 'mobile_money',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: 'mock-user',
      sfd_id: sfdId || 'mock-sfd',
      affects_balance: true
    },
    {
      id: '2',
      name: 'Retrait ATM',
      type: 'withdrawal',
      amount: -25000,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      payment_method: 'atm',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: 'mock-user',
      sfd_id: sfdId || 'mock-sfd',
      affects_balance: true
    },
    {
      id: '3',
      name: 'Remboursement prêt',
      type: 'loan_repayment',
      amount: -15000,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      payment_method: 'bank_transfer',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      user_id: 'mock-user',
      sfd_id: sfdId || 'mock-sfd',
      affects_balance: true
    }
  ];
  
  return mockTransactions;
};

// Add proper import for the Transaction type
import type { Transaction } from '@/types/transactions';


/**
 * Format a currency amount with thousands separator
 */
export const formatCurrencyAmount = (amount: string | number): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '0';
  }
  
  return numericAmount.toLocaleString('fr-FR');
};

/**
 * Convert database records to Transaction objects
 */
export const convertDatabaseRecordsToTransactions = (records: any[], sfdId: string) => {
  return records.map(record => ({
    id: record.id,
    type: record.type || 'deposit',
    amount: record.amount || 0,
    name: record.name || 'Transaction',
    date: record.date || record.created_at || new Date().toISOString(),
    status: record.status || 'completed',
    description: record.description,
    avatar_url: record.avatar_url,
    sfd_id: record.sfd_id || sfdId,
    user_id: record.user_id,
    payment_method: record.payment_method,
    created_at: record.created_at || new Date().toISOString(),
    reference_id: record.reference_id || record.id
  }));
};

/**
 * Generate mock transactions for development
 */
export const generateMockTransactions = (sfdId: string, count = 10) => {
  const types = ['deposit', 'withdrawal', 'payment', 'transfer', 'loan_disbursement', 'loan_repayment'];
  const statuses = ['completed', 'pending', 'failed'];
  const names = [
    'Paiement OrangeMoney', 
    'Transfert vers compte épargne', 
    'Retrait SASU', 
    'Versement mensuel',
    'Achat ecommerce', 
    'Paiement fournisseur'
  ];
  
  return Array.from({ length: count }).map((_, index) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const isPositive = type === 'deposit' || type === 'loan_disbursement';
    const amountBase = Math.floor(Math.random() * 100000) + 5000;
    
    return {
      id: `txn-${Date.now()}-${index}`,
      type: type,
      amount: isPositive ? amountBase : -amountBase,
      name: names[Math.floor(Math.random() * names.length)],
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: `Transaction ${type} simulée`,
      sfd_id: sfdId,
      user_id: 'current-user',
      payment_method: 'bank_transfer',
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      reference_id: `ref-${Date.now()}-${index}`
    };
  });
};

/**
 * Format transaction amount based on transaction type with sign
 */
export const formatTransactionAmount = (amount: string | number, type: string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '0 FCFA';
  }
  
  const isPositive = type === 'deposit' || type === 'loan_disbursement';
  const sign = isPositive ? '+' : '-';
  
  return `${sign}${Math.abs(numericAmount).toLocaleString('fr-FR')} FCFA`;
};

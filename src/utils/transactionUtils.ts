
/**
 * Formats a transaction amount for display, applying the appropriate sign and currency symbol
 * based on the transaction type.
 */
export function formatTransactionAmount(amount: number, type: string): string {
  const formattedAmount = Math.abs(amount).toLocaleString('fr-FR');
  
  if (type === 'deposit' || type === 'loan_disbursement' || 
      (type === 'transfer' && amount > 0)) {
    return `+${formattedAmount} FCFA`;
  } else if (type === 'withdrawal' || type === 'loan_repayment' || 
             (type === 'transfer' && amount < 0)) {
    return `-${formattedAmount} FCFA`;
  } else {
    // Default for other transaction types
    return amount >= 0 ? 
      `+${formattedAmount} FCFA` : 
      `-${formattedAmount} FCFA`;
  }
}

/**
 * Formats a currency amount for display with the appropriate currency symbol
 */
export function formatCurrencyAmount(amount: number, currency: string = 'FCFA'): string {
  return `${Math.abs(amount).toLocaleString('fr-FR')} ${currency}`;
}

/**
 * Converts database records to Transaction objects
 */
export function convertDatabaseRecordsToTransactions(records: any[], sfdId: string): any[] {
  return records.map(record => ({
    ...record,
    sfd_id: sfdId
  }));
}

/**
 * Generates mock transactions for development and testing
 */
export function generateMockTransactions(sfdId: string, count: number = 10): any[] {
  const transactionTypes = ['deposit', 'withdrawal', 'transfer', 'payment', 'loan_repayment'];
  const names = [
    'Dépôt de fonds', 
    'Retrait d\'espèces', 
    'Transfert interne', 
    'Paiement mensuel', 
    'Remboursement de prêt'
  ];
  const statuses = ['success', 'pending', 'failed'];
  
  return Array(count).fill(0).map((_, i) => {
    const typeIndex = Math.floor(Math.random() * transactionTypes.length);
    const type = transactionTypes[typeIndex];
    const isDeposit = type === 'deposit' || (type === 'transfer' && Math.random() > 0.5);
    
    return {
      id: `mock-${i}-${Date.now()}`,
      user_id: `user-${i}`,
      sfd_id: sfdId,
      type,
      amount: isDeposit ? 
        Math.floor(Math.random() * 100000) + 5000 : 
        -1 * (Math.floor(Math.random() * 50000) + 1000),
      name: names[typeIndex],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      description: `Transaction ${i + 1} pour test`
    };
  });
}

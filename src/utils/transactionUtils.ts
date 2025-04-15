
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

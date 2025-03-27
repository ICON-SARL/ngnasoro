
import { Transaction } from '@/types/transactions';

export const convertDatabaseRecordsToTransactions = (
  records: any[], 
  activeSfdId?: string
): Transaction[] => {
  return records.map(record => ({
    id: record.id,
    user_id: record.user_id,
    sfd_id: record.sfd_id || activeSfdId,
    type: record.type as Transaction['type'],
    amount: record.amount,
    status: record.status || 'success',
    created_at: record.created_at || record.date || new Date().toISOString(),
    name: record.name,
    date: record.date,
    avatar_url: record.avatar_url,
    description: `Transaction for ${record.name}`,
  }));
};

export const generateMockTransactions = (sfdId?: string): Transaction[] => {
  const transactionTypes: Transaction['type'][] = ['deposit', 'withdrawal', 'transfer', 'payment', 'loan_disbursement'];
  const statuses: Transaction['status'][] = ['success', 'pending', 'failed', 'flagged'];
  
  const mockTransactions: Transaction[] = [];
  
  for (let i = 0; i < 20; i++) {
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const status = Math.random() > 0.7 
      ? statuses[Math.floor(Math.random() * statuses.length)]
      : 'success';
    
    mockTransactions.push({
      id: `TX${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      sfd_id: sfdId,
      type,
      amount: Math.floor(Math.random() * 9000000) + 10000, // 10K to 9M FCFA
      currency: 'FCFA',
      status,
      description: `Transaction ${type} #${i+1}`,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(), // Over the last 24h
      payment_method: ['cash', 'mobile_money', 'transfer', 'check'][Math.floor(Math.random() * 4)],
    });
  }
  
  return mockTransactions;
};

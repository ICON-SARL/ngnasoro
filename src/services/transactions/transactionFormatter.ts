
import { Transaction } from '@/types/transactions';
import { TransactionType, TransactionStatus } from './types';

/**
 * Format a database record into a Transaction object
 */
export function formatTransaction(record: any): Transaction {
  return {
    id: record.id,
    user_id: record.user_id,
    sfd_id: record.sfd_id,
    type: record.type as TransactionType,
    amount: record.amount,
    status: 'success' as TransactionStatus, // Default status since it's not in our schema
    description: record.description,
    metadata: record.metadata,
    payment_method: record.payment_method,
    reference_id: record.reference_id,
    created_at: record.created_at || record.date,
    updated_at: record.updated_at,
    date: record.date,
    name: record.name,
    avatar_url: record.avatar_url
  };
}

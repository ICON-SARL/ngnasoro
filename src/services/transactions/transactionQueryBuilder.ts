
import { supabase } from '@/integrations/supabase/client';
import { TransactionFilters } from './types';

/**
 * Builds a Supabase query for fetching transactions with filters
 */
export function buildTransactionQuery(userId?: string, sfdId?: string, filters?: TransactionFilters) {
  // Build the query with type cast to avoid excessive type instantiation
  const query = supabase
    .from('transactions')
    .select('*');
  
  // Apply user_id filter if provided
  if (userId) {
    query.eq('user_id', userId);
  }
  
  // Apply sfd_id filter if provided
  if (sfdId) {
    query.eq('sfd_id', sfdId);
  }
  
  // Apply optional filters
  if (filters) {
    // Filter by type
    if (filters.type) {
      if (Array.isArray(filters.type)) {
        query.in('type', filters.type);
      } else {
        query.eq('type', filters.type);
      }
    }
    
    // Date range filters
    if (filters.startDate) {
      query.gte('date', filters.startDate);
    }
    
    if (filters.endDate) {
      query.lte('date', filters.endDate);
    }
    
    // Amount range filters
    if (filters.minAmount) {
      query.gte('amount', filters.minAmount);
    }
    
    if (filters.maxAmount) {
      query.lte('amount', filters.maxAmount);
    }
    
    // Search term
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      // Use ilike for case-insensitive search
      query.ilike('name', `%${filters.searchTerm}%`);
    }
  }
  
  // Order by date (newest first)
  query.order('date', { ascending: false });
  
  return query;
}

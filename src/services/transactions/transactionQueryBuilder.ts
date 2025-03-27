
import { supabase } from '@/integrations/supabase/client';
import { TransactionFilters } from './types';

/**
 * Builds a Supabase query for fetching transactions with filters
 */
export function buildTransactionQuery(userId?: string, sfdId?: string, filters?: TransactionFilters) {
  // Start with a basic query
  let query = supabase.from('transactions').select('*');
  
  // Apply user_id filter if provided
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  // Apply sfd_id filter if provided
  if (sfdId) {
    query = query.eq('sfd_id', sfdId);
  }
  
  // Apply optional filters
  if (filters) {
    // Filter by type
    if (filters.type) {
      if (Array.isArray(filters.type)) {
        query = query.in('type', filters.type);
      } else {
        query = query.eq('type', filters.type);
      }
    }
    
    // Date range filters
    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }
    
    // Amount range filters
    if (filters.minAmount) {
      query = query.gte('amount', filters.minAmount);
    }
    
    if (filters.maxAmount) {
      query = query.lte('amount', filters.maxAmount);
    }
    
    // Search term
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      // Use ilike for case-insensitive search
      query = query.ilike('name', `%${filters.searchTerm}%`);
    }
  }
  
  // Order by date (newest first)
  query = query.order('date', { ascending: false });
  
  return query;
}

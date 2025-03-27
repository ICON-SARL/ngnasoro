
import { supabase } from '@/integrations/supabase/client';
import { TransactionFilters } from './types';

/**
 * Builds a Supabase query for fetching transactions with filters
 */
export function buildTransactionQuery(userId?: string, sfdId?: string, filters?: TransactionFilters) {
  // Create a base query that we'll modify with our filters
  // We cast to any to avoid TypeScript type depth issues with the query builder
  const query = supabase.from('transactions').select('*') as any;
  
  // Apply filters directly to the query object
  // By casting to any, we prevent TypeScript from trying to track the complex nested types
  
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
    if (filters.minAmount !== undefined) {
      query.gte('amount', filters.minAmount);
    }
    
    if (filters.maxAmount !== undefined) {
      query.lte('amount', filters.maxAmount);
    }
    
    // Search term
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      // Use ilike for case-insensitive search
      query.ilike('name', `%${filters.searchTerm}%`);
    }
    
    // Category filter
    if (filters.category) {
      query.eq('category', filters.category);
    }
    
    // Status filter
    if (filters.status) {
      query.eq('status', filters.status);
    }
    
    // Payment method filter
    if (filters.paymentMethod) {
      query.eq('payment_method', filters.paymentMethod);
    }

    // Limit results
    if (filters.limit) {
      query.limit(filters.limit);
    }
  }
  
  // Order by date (newest first)
  query.order('date', { ascending: false });
  
  // Return the final query, casting back to the appropriate type
  return query;
}

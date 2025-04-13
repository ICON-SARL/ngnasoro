
import { supabase } from '@/integrations/supabase/client';
import { Account } from './types';

export const accountService = {
  async fetchUserAccount(userId: string): Promise<Account | null> {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching account:', error);
      throw error;
    }
    
    return data;
  },
  
  async updateAccountBalance(userId: string, amount: number): Promise<Account> {
    if (!userId) throw new Error('User not logged in');
    
    // Get current balance first
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', userId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Update with new balance
    const { data, error } = await supabase
      .from('accounts')
      .update({ balance: account.balance + amount })
      .eq('user_id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};

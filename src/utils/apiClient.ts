
import { supabase } from "@/integrations/supabase/client";
import { handleError, handleApiResponse } from "./errorHandler";

export const apiClient = {
  // SFD data access methods
  async getSfdsList() {
    try {
      const { data, error } = await supabase
        .from('sfds')
        .select('id, name, region, code, logo_url');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    }
  },
  
  async getUserSfds(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_sfds')
        .select(`
          id,
          is_default,
          sfds:sfd_id(id, name, code, region, logo_url)
        `)
        .eq('user_id', userId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    }
  },
  
  async getSfdBalance(userId: string, sfdId: string) {
    try {
      // In a real app, this would fetch from a sfd_accounts table
      // For now we'll simulate with fixed data based on the SFD
      const { data, error } = await supabase
        .from('user_sfds')
        .select('id')
        .eq('user_id', userId)
        .eq('sfd_id', sfdId)
        .single();
        
      if (error) throw error;
      
      // Return mock data based on SFD ID
      if (sfdId.includes('1') || sfdId === 'sfd1') {
        return { balance: 250000, currency: 'FCFA' };
      } else {
        return { balance: 175000, currency: 'FCFA' };
      }
    } catch (error) {
      handleError(error);
      return { balance: 0, currency: 'FCFA' };
    }
  },
  
  async getSfdLoans(userId: string, sfdId: string) {
    try {
      // Simulated loans data
      if (sfdId.includes('1') || sfdId === 'sfd1') {
        return [{
          id: 'loan1',
          amount: 500000,
          remainingAmount: 350000,
          nextDueDate: '2023-05-15',
          isLate: false
        }];
      } else {
        return [{
          id: 'loan2',
          amount: 300000,
          remainingAmount: 100000,
          nextDueDate: '2023-05-02',
          isLate: true
        }];
      }
    } catch (error) {
      handleError(error);
      return [];
    }
  },
  
  // User profile methods
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    }
  },
  
  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    }
  },
  
  // Transaction methods
  async getUserTransactions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleError(error);
      return [];
    }
  },
  
  // Edge function callers
  async callEdgeFunction(functionName: string, payload: any) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: JSON.stringify(payload),
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    }
  },
  
  // Storage methods
  async uploadFile(bucket: string, path: string, file: File) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
      return null;
    }
  },
  
  getFileUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
};

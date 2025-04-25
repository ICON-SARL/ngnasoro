import { supabase } from '@/integrations/supabase/client';
import { SfdClient } from '@/types/sfdClients';

export interface ClientDocument {
  id: string;
  client_id: string;
  document_type: string;
  document_url: string;
  uploaded_at: string;
  status: string;
  verified: boolean;
  verified_at?: string;
  verified_by?: string;
}

export interface ClientActivity {
  id: string;
  client_id: string;
  activity_type: string;
  description?: string;
  performed_at: string;
  performed_by?: string;
}

/**
 * Get all clients for a specific SFD
 */
export const getSfdClients = async (sfdId: string) => {
  try {
    const { data, error } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('sfd_id', sfdId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as SfdClient[];
  } catch (error) {
    console.error('Error in getSfdClients:', error);
    return [];
  }
};

// SFD Client Management API functions
export const sfdClientApi = {
  // Get clients for current SFD admin
  async getSfdClients() {
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as SfdClient[];
    } catch (error) {
      console.error('Error fetching SFD clients:', error);
      return [];
    }
  },
  
  // Get client by ID
  async getClientById(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (error) throw error;
      return data as SfdClient;
    } catch (error) {
      console.error('Error fetching client details:', error);
      return null;
    }
  },
  
  // Create new client
  async createClient(client: Omit<SfdClient, 'id' | 'created_at' | 'status' | 'kyc_level'>) {
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert({
          ...client,
          status: 'pending',
          kyc_level: 0
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as SfdClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },
  
  // Update client
  async updateClient(clientId: string, updates: Partial<SfdClient>) {
    try {
      // Convert kyc_level if needed
      let dbUpdates: any = { ...updates };
      
      // If kyc_level exists in updates and is a string, convert it to number
      if (updates.kyc_level !== undefined) {
        // Handle the case where kyc_level might be provided as a string
        if (typeof updates.kyc_level === 'string') {
          if (updates.kyc_level === 'none') dbUpdates.kyc_level = 0;
          else if (updates.kyc_level === 'basic') dbUpdates.kyc_level = 1;
          else if (updates.kyc_level === 'full') dbUpdates.kyc_level = 2;
        }
        // If it's already a number, keep it as is
      }

      const { data, error } = await supabase
        .from('sfd_clients')
        .update(dbUpdates)
        .eq('id', clientId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },
  
  // Validate client account
  async validateClientAccount(clientId: string, validatedBy: string, notes?: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .update({
          status: 'validated',
          validated_at: new Date().toISOString(),
          validated_by: validatedBy,
          notes: notes
        })
        .eq('id', clientId)
        .select()
        .single();
        
      if (error) throw error;
      return data as SfdClient;
    } catch (error) {
      console.error('Error validating client account:', error);
      throw error;
    }
  },
  
  // Reject client account
  async rejectClientAccount(clientId: string, validatedBy: string, notes?: string) {
    try {
      const { data, error } = await supabase
        .from('sfd_clients')
        .update({
          status: 'rejected',
          validated_at: new Date().toISOString(),
          validated_by: validatedBy,
          notes: notes
        })
        .eq('id', clientId)
        .select()
        .single();
        
      if (error) throw error;
      return data as SfdClient;
    } catch (error) {
      console.error('Error rejecting client account:', error);
      throw error;
    }
  },
  
  // Get client documents
  async getClientDocuments(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId);

      if (error) throw error;
      
      // Add status field to each document to match ClientDocument interface
      const documentsWithStatus = data.map(doc => ({
        ...doc,
        status: doc.verified ? 'verified' : 'pending'
      }));
      
      return documentsWithStatus as ClientDocument[];
    } catch (error) {
      console.error('Error fetching client documents:', error);
      return [];
    }
  },
  
  // Add client document
  async addClientDocument(document: Omit<ClientDocument, 'id' | 'uploaded_at' | 'verified' | 'verified_at' | 'verified_by'>) {
    try {
      const { data, error } = await supabase
        .from('client_documents')
        .insert({
          client_id: document.client_id,
          document_type: document.document_type,
          document_url: document.document_url,
          verified: false
        })
        .select()
        .single();
        
      if (error) throw error;
      return data as ClientDocument;
    } catch (error) {
      console.error('Error adding client document:', error);
      throw error;
    }
  },
  
  // Verify client document
  async verifyClientDocument(documentId: string, verifiedBy: string) {
    try {
      const { data, error } = await supabase
        .from('client_documents')
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
          verified_by: verifiedBy
        })
        .eq('id', documentId)
        .select()
        .single();
        
      if (error) throw error;
      return data as ClientDocument;
    } catch (error) {
      console.error('Error verifying client document:', error);
      throw error;
    }
  },
  
  // Get client activities
  async getClientActivities(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('client_activities')
        .select('*')
        .eq('client_id', clientId)
        .order('performed_at', { ascending: false });
        
      if (error) throw error;
      return data as ClientActivity[];
    } catch (error) {
      console.error('Error fetching client activities:', error);
      return [];
    }
  },
  
  // Upload document to storage
  async uploadClientDocument(userId: string, file: File, documentType: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${documentType}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('client_documents')
        .upload(fileName, file);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('client_documents')
        .getPublicUrl(fileName);
        
      return publicUrl;
    } catch (error) {
      console.error('Error uploading client document:', error);
      throw error;
    }
  },
  
  // Create client savings account
  async createClientSavingsAccount(clientId: string, sfdId: string, initialBalance: number = 0) {
    try {
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
        
      if (clientError || !client?.user_id) {
        throw new Error('Client not found or no user account');
      }
      
      // Instead of calling the RPC, we'll directly insert into the accounts table
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: client.user_id,
          sfd_id: sfdId,
          balance: initialBalance,
          currency: 'FCFA'
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating client savings account:', error);
      throw error;
    }
  },
  
  // Get client account balance
  async getClientAccountBalance(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('balance, currency')
        .eq('user_id', clientId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching client account balance:', error);
      return { balance: 0, currency: 'FCFA' };
    }
  }
};

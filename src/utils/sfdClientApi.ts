
import { supabase } from "@/integrations/supabase/client";
import { SfdClient, ClientDocument, ClientActivity } from "@/types/sfdClients";
import { useToast } from "@/hooks/use-toast";

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
      const { data, error } = await supabase
        .from('sfd_clients')
        .update(updates)
        .eq('id', clientId)
        .select()
        .single();
        
      if (error) throw error;
      return data as SfdClient;
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
      return data as ClientDocument[];
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
          ...document,
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
  }
};


import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Interfaces for client service
interface CreateClientParams {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  sfd_id: string;
  status: string;
}

// Service for client operations
export const clientService = {
  createClient: async (params: CreateClientParams) => {
    try {
      // Generate a reference number for adhesion request
      const referenceNumber = `ADH-${Date.now().toString().substring(6)}`;
      
      // Fix: Add required fields for client_adhesion_requests
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          full_name: params.full_name,
          email: params.email,
          phone: params.phone,
          address: params.address,
          sfd_id: params.sfd_id,
          status: params.status,
          reference_number: referenceNumber,
          user_id: (await supabase.auth.getUser()).data.user?.id || uuidv4()
        })
        .select();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },
  
  // add other client service methods here
};

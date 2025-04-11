
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Sfd {
  id: string;
  name: string;
  code: string;
  region: string;
  status: string;
  logo_url: string | null;
  contact_email: string | null;
  phone: string | null;
  description: string | null;
  legal_document_url: string | null;
  created_at: string;
}

export const useSfdData = (sfdId?: string) => {
  const fetchSfdData = async (): Promise<Sfd | null> => {
    if (!sfdId) return null;
    
    const { data, error } = await supabase
      .from('sfds')
      .select('*')
      .eq('id', sfdId)
      .single();
      
    if (error) {
      console.error('Error fetching SFD data:', error);
      throw error;
    }
    
    return data as Sfd;
  };
  
  return useQuery({
    queryKey: ['sfd-data', sfdId],
    queryFn: fetchSfdData,
    enabled: !!sfdId,
  });
};

export const useSfdsList = () => {
  const fetchSfdsList = async (): Promise<Sfd[]> => {
    const { data, error } = await supabase
      .from('sfds')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching SFDs list:', error);
      throw error;
    }
    
    return data as Sfd[];
  };
  
  return useQuery({
    queryKey: ['sfds-list'],
    queryFn: fetchSfdsList,
  });
};

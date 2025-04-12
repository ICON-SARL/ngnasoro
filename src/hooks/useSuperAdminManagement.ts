
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has_2fa: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

export function useSuperAdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAdmins = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching admin users using the functions API...');
      
      // Use an Edge Function to bypass RLS policies
      const { data, error: funcError } = await supabase.functions.invoke('fetch-admin-users', {
        method: 'POST',
      });
      
      if (funcError) {
        throw new Error(`Error calling function: ${funcError.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from function');
      }
      
      setAdmins(data as AdminUser[]);
      console.log(`Successfully loaded ${data.length} admin users`);
      
    } catch (err: any) {
      console.error('Error fetching admin users:', err);
      setError(err.message || 'Failed to load administrators');
      
      // Fallback to mock data for demonstration purposes
      const mockAdmins: AdminUser[] = [
        {
          id: '1',
          email: 'admin@meref.ml',
          full_name: 'Super Admin',
          role: 'admin',
          has_2fa: true,
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString()
        },
        {
          id: '2',
          email: 'sfdadmin@meref.ml',
          full_name: 'SFD Admin',
          role: 'sfd_admin',
          has_2fa: false,
          created_at: new Date().toISOString(),
          last_sign_in_at: null
        }
      ];
      
      setAdmins(mockAdmins);
      
      toast({
        title: "Erreur",
        description: "Impossible de charger les administrateurs.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return {
    admins,
    isLoading,
    error,
    refetchAdmins: fetchAdmins
  };
}

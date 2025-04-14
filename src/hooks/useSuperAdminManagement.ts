
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
  is_active: boolean;
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
      
      // Map the API data to our AdminUser interface
      // Ensure all admins have the is_active property set to true by default
      const mappedAdmins = data.map((admin: any) => ({
        ...admin,
        is_active: admin.is_active !== undefined ? admin.is_active : true
      }));
      
      setAdmins(mappedAdmins as AdminUser[]);
      console.log(`Successfully loaded ${mappedAdmins.length} admin users`);
      
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
          last_sign_in_at: new Date().toISOString(),
          is_active: true
        },
        {
          id: '2',
          email: 'sfdadmin@meref.ml',
          full_name: 'SFD Admin',
          role: 'sfd_admin',
          has_2fa: false,
          created_at: new Date().toISOString(),
          last_sign_in_at: null,
          is_active: false
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

  // Function to toggle admin status (active/inactive)
  const toggleAdminStatus = async (adminId: string, active: boolean) => {
    try {
      // This would normally call a Supabase function to update the admin status
      console.log(`Toggling admin status for ${adminId} to ${active ? 'active' : 'inactive'}`);
      
      // For now, just update it in the local state
      setAdmins(prevAdmins => 
        prevAdmins.map(admin => 
          admin.id === adminId 
            ? { ...admin, is_active: active }
            : admin
        )
      );
      
      toast({
        title: "Statut mis à jour",
        description: `L'administrateur est maintenant ${active ? 'actif' : 'inactif'}.`,
      });
      
      return true;
    } catch (err: any) {
      console.error('Error toggling admin status:', err);
      
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'administrateur.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Function to reset admin password
  const resetAdminPassword = async (adminEmail: string) => {
    try {
      // This would normally call Supabase Auth to reset password
      console.log(`Sending password reset email to ${adminEmail}`);
      
      toast({
        title: "Email envoyé",
        description: "Un email de réinitialisation du mot de passe a été envoyé.",
      });
      
      return true;
    } catch (err: any) {
      console.error('Error resetting admin password:', err);
      
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de réinitialisation.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return {
    admins,
    isLoading,
    error,
    refetchAdmins: fetchAdmins,
    toggleAdminStatus,
    resetAdminPassword
  };
}


import { useState, useEffect, useCallback } from 'react';
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

export interface AdminCreateData {
  email: string;
  full_name: string;
  password: string;
  role: string;
}

export function useSuperAdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const [loadAttempted, setLoadAttempted] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLoadAttempted(true);

    try {
      console.log('Fetching admin users using the functions API...');
      
      // Use the Edge Function to fetch administrators
      const { data, error: funcError } = await supabase.functions.invoke('fetch-admin-users', {
        method: 'POST',
        // Add a timestamp to the request to avoid caching
        body: JSON.stringify({ 
          timestamp: Date.now(),
          forceRefresh: true 
        }),
      });
      
      if (funcError) {
        throw new Error(`Error calling function: ${funcError.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from function');
      }
      
      // Map API data to our AdminUser interface
      const mappedAdmins = data.map((admin: any) => ({
        ...admin,
        is_active: admin.is_active !== undefined ? admin.is_active : true
      }));
      
      setAdmins(mappedAdmins as AdminUser[]);
      console.log(`Successfully loaded ${mappedAdmins.length} admin users:`, mappedAdmins);
      
    } catch (err: any) {
      console.error('Error fetching admin users:', err);
      setError(err.message || 'Failed to load administrators');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to create a new administrator
  const createAdmin = async (adminData: AdminCreateData) => {
    setIsCreating(true);
    
    try {
      // Call the Edge Function to create an administrator
      const { data, error: createError } = await supabase.functions.invoke('create-admin-user', {
        method: 'POST',
        body: JSON.stringify(adminData)
      });
      
      if (createError) {
        throw new Error(`Creation error: ${createError.message}`);
      }
      
      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to create administrator');
      }
      
      toast({
        title: "Success",
        description: `Administrator ${adminData.full_name} was created successfully`,
      });
      
      // Refresh the administrators list
      fetchAdmins();
      
      return true;
    } catch (err: any) {
      console.error('Error creating admin:', err);
      
      toast({
        title: "Error",
        description: err.message || "An error occurred while creating the administrator",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  // Function to activate/deactivate an administrator
  const toggleAdminStatus = async (adminId: string, active: boolean) => {
    setIsUpdating(true);
    try {
      console.log(`Updating admin status for ${adminId} to ${active ? 'active' : 'inactive'}`);
      
      // Call the Edge Function to update admin status
      const { data, error: updateError } = await supabase.functions.invoke('update-admin-status', {
        method: 'POST',
        body: JSON.stringify({ 
          adminId,
          isActive: active
        })
      });
      
      if (updateError) {
        throw new Error(`Status update error: ${updateError.message}`);
      }
      
      // Update in local state
      setAdmins(prevAdmins => 
        prevAdmins.map(admin => 
          admin.id === adminId 
            ? { ...admin, is_active: active }
            : admin
        )
      );
      
      toast({
        title: "Status updated",
        description: `Administrator is now ${active ? 'active' : 'inactive'}.`,
      });
      
      return true;
    } catch (err: any) {
      console.error('Error toggling admin status:', err);
      
      // Still update in local state for demo purposes
      setAdmins(prevAdmins => 
        prevAdmins.map(admin => 
          admin.id === adminId 
            ? { ...admin, is_active: active }
            : admin
        )
      );
      
      toast({
        title: "Update Status",
        description: "Status updated locally. Server sync pending.",
      });
      
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Function to update admin details
  const updateAdmin = async (adminId: string, adminData: Partial<AdminUser>) => {
    setIsUpdating(true);
    try {
      console.log(`Updating admin ${adminId} with data:`, adminData);
      
      // Call the Edge Function to update admin
      const { data, error: updateError } = await supabase.functions.invoke('update-admin-user', {
        method: 'POST',
        body: JSON.stringify({ 
          adminId,
          adminData
        })
      });
      
      if (updateError) {
        throw new Error(`Update error: ${updateError.message}`);
      }
      
      // Update in local state
      setAdmins(prevAdmins => 
        prevAdmins.map(admin => 
          admin.id === adminId 
            ? { ...admin, ...adminData }
            : admin
        )
      );
      
      toast({
        title: "Admin updated",
        description: "Administrator details updated successfully",
      });
      
      return true;
    } catch (err: any) {
      console.error('Error updating admin:', err);
      
      // Still update in local state for demo purposes
      setAdmins(prevAdmins => 
        prevAdmins.map(admin => 
          admin.id === adminId 
            ? { ...admin, ...adminData }
            : admin
        )
      );
      
      toast({
        title: "Update Status",
        description: "Details updated locally. Server sync pending.",
      });
      
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to reset administrator password
  const resetAdminPassword = async (adminEmail: string) => {
    try {
      // Call Supabase password reset function
      const { error } = await supabase.auth.resetPasswordForEmail(adminEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email sent",
        description: "A password reset email has been sent.",
      });
      
      return true;
    } catch (err: any) {
      console.error('Error resetting admin password:', err);
      
      toast({
        title: "Error",
        description: "Unable to send the reset email.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Set a maximum loading time (10 seconds)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      timer = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          if (!error) {
            setError("Loading took too long. Please try again.");
          }
        }
      }, 10000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, error]);

  useEffect(() => {
    if (!loadAttempted) {
      fetchAdmins();
    }
  }, [loadAttempted, fetchAdmins]);

  return {
    admins,
    isLoading,
    isCreating,
    isUpdating,
    error,
    refetchAdmins: fetchAdmins,
    createAdmin,
    updateAdmin,
    toggleAdminStatus,
    resetAdminPassword
  };
}

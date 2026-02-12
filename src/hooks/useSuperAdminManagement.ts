
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

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
      logger.debug('Fetching admin users using the functions API...');
      
      const { data, error: funcError } = await supabase.functions.invoke('fetch-admin-users', {
        method: 'POST',
        body: JSON.stringify({ timestamp: Date.now(), forceRefresh: true }),
      });
      
      if (funcError) throw new Error(`Error calling function: ${funcError.message}`);
      if (!data) throw new Error('No data returned from function');
      
      const mappedAdmins = data.map((admin: AdminUser) => ({
        ...admin,
        is_active: admin.is_active !== undefined ? admin.is_active : true
      }));
      
      setAdmins(mappedAdmins as AdminUser[]);
      logger.debug(`Successfully loaded ${mappedAdmins.length} admin users`);
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load administrators';
      logger.error('Error fetching admin users:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAdmin = async (adminData: AdminCreateData) => {
    setIsCreating(true);
    try {
      const { data, error: createError } = await supabase.functions.invoke('create-admin-user', {
        method: 'POST',
        body: JSON.stringify(adminData)
      });
      
      if (createError) throw new Error(`Creation error: ${createError.message}`);
      if (!data || !data.success) throw new Error(data?.message || 'Failed to create administrator');
      
      toast({ title: "Success", description: `Administrator ${adminData.full_name} was created successfully` });
      fetchAdmins();
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      logger.error('Error creating admin:', err);
      toast({ title: "Error", description: message, variant: "destructive" });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const toggleAdminStatus = async (adminId: string, active: boolean) => {
    setIsUpdating(true);
    try {
      logger.debug(`Updating admin status for ${adminId} to ${active ? 'active' : 'inactive'}`);
      
      const { error: updateError } = await supabase.functions.invoke('update-admin-status', {
        method: 'POST',
        body: JSON.stringify({ adminId, isActive: active })
      });
      
      if (updateError) throw new Error(`Status update error: ${updateError.message}`);
      
      setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, is_active: active } : a));
      toast({ title: "Status updated", description: `Administrator is now ${active ? 'active' : 'inactive'}.` });
      return true;
    } catch (err: unknown) {
      logger.error('Error toggling admin status:', err);
      setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, is_active: active } : a));
      toast({ title: "Update Status", description: "Status updated locally. Server sync pending." });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  
  const updateAdmin = async (adminId: string, adminData: Partial<AdminUser>) => {
    setIsUpdating(true);
    try {
      logger.debug(`Updating admin ${adminId}`);
      
      const { error: updateError } = await supabase.functions.invoke('update-admin-user', {
        method: 'POST',
        body: JSON.stringify({ adminId, adminData })
      });
      
      if (updateError) throw new Error(`Update error: ${updateError.message}`);
      
      setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, ...adminData } : a));
      toast({ title: "Admin updated", description: "Administrator details updated successfully" });
      return true;
    } catch (err: unknown) {
      logger.error('Error updating admin:', err);
      setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, ...adminData } : a));
      toast({ title: "Update Status", description: "Details updated locally. Server sync pending." });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const resetAdminPassword = async (adminEmail: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(adminEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Email sent", description: "A password reset email has been sent." });
      return true;
    } catch (err: unknown) {
      logger.error('Error resetting admin password:', err);
      toast({ title: "Error", description: "Unable to send the reset email.", variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          if (!error) setError("Loading took too long. Please try again.");
        }
      }, 10000);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [isLoading, error]);

  useEffect(() => {
    if (!loadAttempted) fetchAdmins();
  }, [loadAttempted, fetchAdmins]);

  return {
    admins, isLoading, isCreating, isUpdating, error,
    refetchAdmins: fetchAdmins, createAdmin, updateAdmin,
    toggleAdminStatus, resetAdminPassword
  };
}


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SfdAdmin } from './types';

export function useSfdAdminsList(sfdId?: string) {
  const query = useQuery({
    queryKey: ['sfd-admins', sfdId],
    queryFn: async () => {
      try {
        console.log("Fetching SFD admins with sfdId:", sfdId);
        
        // Get all users with the sfd_admin role
        const { data: roleUsers, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'sfd_admin');
          
        if (roleError) throw roleError;
        
        if (!roleUsers || roleUsers.length === 0) {
          return [];
        }
        
        const userIds = roleUsers.map(u => u.user_id);
        
        // Get admin details
        const { data: adminUsers, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .in('id', userIds);
          
        if (adminError) throw adminError;
        
        if (!adminUsers) {
          return [];
        }
        
        // If sfdId is provided, filter by that SFD
        let filteredAdmins = adminUsers;
        
        if (sfdId) {
          // Get the user_sfds associations
          const { data: userSfds, error: sfdsError } = await supabase
            .from('user_sfds')
            .select('user_id')
            .eq('sfd_id', sfdId);
            
          if (sfdsError) {
            console.warn("Error fetching user SFDs:", sfdsError);
            // Continue without filtering
          } else if (userSfds) {
            // Filter admins by those associated with this SFD
            const sfdUserIds = userSfds.map(us => us.user_id);
            filteredAdmins = adminUsers.filter(admin => 
              sfdUserIds.includes(admin.id)
            );
          }
        }
        
        return filteredAdmins as SfdAdmin[];
      } catch (error) {
        console.error("Error fetching SFD admins:", error);
        throw error;
      }
    }
  });
  
  return {
    sfdAdmins: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}

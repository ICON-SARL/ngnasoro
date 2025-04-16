
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useActivateTables() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Activate RLS on all necessary tables
   */
  const activateSystem = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Call the synchronize-user-roles function to enable RLS
      const { data, error } = await supabase.functions.invoke('synchronize-user-roles', {
        body: JSON.stringify({
          action: 'enable_rls',
          tables: [
            'accounts',
            'client_activities',
            'client_adhesion_requests',
            'client_documents',
            'loan_activities',
            'loan_payments',
            'meref_loan_requests',
            'profiles',
            'sfd_clients',
            'sfd_loans',
            'transactions',
            'user_roles'
          ]
        })
      });
      
      if (error) {
        console.error('Error activating system:', error);
        toast({
          title: "Erreur d'activation",
          description: `Impossible d'activer le système: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Système activé",
        description: `Tables RLS activées: ${data?.tables?.length || 0}`,
      });
      
      return true;
    } catch (err: any) {
      console.error('Error in activateSystem:', err);
      toast({
        title: "Erreur d'activation",
        description: err.message || "Une erreur s'est produite",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Synchronize user roles between auth.users and user_roles table
   */
  const activateUserRolesSync = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Call the synchronize-user-roles function
      const { data, error } = await supabase.functions.invoke('synchronize-user-roles', {
        body: JSON.stringify({})
      });
      
      if (error) {
        console.error('Error syncing user roles:', error);
        toast({
          title: "Erreur de synchronisation",
          description: `Impossible de synchroniser les rôles: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Rôles synchronisés",
        description: data?.message || "La synchronisation des rôles a réussi",
      });
      
      return true;
    } catch (err: any) {
      console.error('Error in activateUserRolesSync:', err);
      toast({
        title: "Erreur de synchronisation",
        description: err.message || "Une erreur s'est produite",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    activateSystem,
    activateUserRolesSync
  };
}

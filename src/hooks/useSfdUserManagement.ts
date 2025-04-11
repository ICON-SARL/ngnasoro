
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';

export interface SfdUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastActive?: string;
}

export interface UserFormValues {
  name: string;
  email: string;
  role: string;
  password: string;
  sendNotification: boolean;
}

export function useSfdUserManagement() {
  const [users, setUsers] = useState<SfdUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSfdUsers = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Get the default SFD for the current user
      const { data: userSfds, error: sfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id, is_default')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();
        
      if (sfdsError) {
        console.error('Erreur lors de la récupération du SFD:', sfdsError);
        throw new Error("Impossible de déterminer votre SFD");
      }
      
      if (!userSfds?.sfd_id) {
        throw new Error("Aucun SFD associé à votre compte");
      }
      
      // First get the user_ids associated with this SFD
      const { data: userAssociations, error: associationsError } = await supabase
        .from('user_sfds')
        .select('user_id')
        .eq('sfd_id', userSfds.sfd_id);
        
      if (associationsError) {
        console.error('Erreur lors de la récupération des associations:', associationsError);
        throw new Error("Impossible de charger les associations d'utilisateurs");
      }
      
      if (!userAssociations || userAssociations.length === 0) {
        setUsers([]);
        return;
      }

      // Extract the user_ids from the associations
      const userIds = userAssociations.map(assoc => assoc.user_id);
      
      // Get all admin users associated with those user_ids
      const { data: adminUsers, error: usersError } = await supabase
        .from('admin_users')
        .select('id, email, full_name, role, last_sign_in_at')
        .in('id', userIds);
        
      if (usersError) {
        console.error('Erreur lors de la récupération des utilisateurs:', usersError);
        throw new Error("Impossible de charger les utilisateurs");
      }
      
      if (!adminUsers || adminUsers.length === 0) {
        setUsers([]);
        return;
      }
      
      // Transform the data into our SfdUser format
      const formattedUsers: SfdUser[] = adminUsers.map(userData => ({
        id: userData.id,
        name: userData.full_name,
        email: userData.email,
        role: userData.role === 'sfd_admin' ? 'Gérant' : 'Agent de Crédit',
        status: 'active',
        lastActive: userData.last_sign_in_at 
          ? new Date(userData.last_sign_in_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          : 'Jamais'
      }));
      
      setUsers(formattedUsers);
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSfdUser = async (userData: UserFormValues) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    try {
      const { data: userSfds, error: sfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id, is_default, sfds(name)')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();
        
      if (sfdsError) {
        throw new Error("Impossible de déterminer votre SFD");
      }
      
      if (!userSfds?.sfd_id) {
        throw new Error("Aucun SFD associé à votre compte");
      }
      
      const { data, error } = await supabase.functions.invoke('create-sfd-admin', {
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          full_name: userData.name,
          role: userData.role === 'Gérant' ? 'sfd_admin' : 'credit_agent',
          sfd_id: userSfds.sfd_id,
          notify: userData.sendNotification
        })
      });
      
      if (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      toast({
        title: "Succès",
        description: `${userData.name} a été ajouté en tant que ${userData.role}`,
      });
      
      await fetchSfdUsers();
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSfdUser = async (adminId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-sfd-admin', {
        body: JSON.stringify({
          adminId
        })
      });
      
      if (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      toast({
        title: "Succès",
        description: "L'utilisateur a été supprimé avec succès",
      });
      
      await fetchSfdUsers();
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      user.role.toLowerCase().includes(searchTermLower)
    );
  });

  useEffect(() => {
    if (user) {
      fetchSfdUsers();
    }
  }, [user]);

  return {
    users: filteredUsers,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    addSfdUser,
    deleteSfdUser,
    refreshUsers: fetchSfdUsers
  };
}

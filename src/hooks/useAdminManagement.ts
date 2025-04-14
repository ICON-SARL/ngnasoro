
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'sfd_admin';
  has_2fa: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

interface AdminFormData {
  email: string;
  full_name: string;
  role: 'admin' | 'sfd_admin';
  password: string;
  sendInvite?: boolean;
}

export function useAdminManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for admin users
  const mockAdmins: AdminUser[] = [
    {
      id: "admin1",
      email: "admin@meref.org",
      full_name: "Admin Principal",
      role: "admin",
      has_2fa: true,
      created_at: "2022-10-10T09:30:00Z",
      last_sign_in_at: "2023-04-28T14:15:00Z"
    },
    {
      id: "sfdadmin1",
      email: "director@rcpb.org",
      full_name: "Directeur RCPB",
      role: "sfd_admin",
      has_2fa: false,
      created_at: "2022-11-05T11:20:00Z",
      last_sign_in_at: "2023-04-26T10:45:00Z"
    }
  ];

  // Fetch admin users
  const fetchAdmins = async (): Promise<AdminUser[]> => {
    try {
      // In a real implementation, we would fetch from Supabase
      // For now, return mock data
      return mockAdmins;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
  };

  // Use React Query to manage the data fetching
  const { data: admins, refetch } = useQuery({
    queryKey: ['admins'],
    queryFn: fetchAdmins,
    initialData: mockAdmins
  });

  // Create admin user
  const createAdmin = useMutation({
    mutationFn: async (adminData: AdminFormData) => {
      setIsLoading(true);
      try {
        // In a real implementation, we would create a user in Supabase Auth
        // and create a corresponding admin record
        console.log(`Creating admin with data:`, adminData);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { 
          success: true, 
          admin: {
            ...adminData,
            id: `admin${Date.now()}`,
            has_2fa: false,
            created_at: new Date().toISOString(),
            last_sign_in_at: null
          } 
        };
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({
        title: 'Administrateur créé',
        description: `${variables.full_name} a été ajouté avec le rôle ${variables.role === 'admin' ? 'administrateur' : 'administrateur SFD'}`,
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur est survenue lors de la création",
        variant: 'destructive',
      });
    }
  });

  // Update admin user
  const updateAdmin = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdminFormData> }) => {
      setIsLoading(true);
      try {
        // In a real implementation, we would update the user in Supabase Auth
        // and update the corresponding admin record
        console.log(`Updating admin ${id} with data:`, data);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({
        title: 'Administrateur mis à jour',
        description: 'Les informations ont été mises à jour avec succès',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur est survenue lors de la mise à jour",
        variant: 'destructive',
      });
    }
  });

  // Delete admin user
  const deleteAdmin = useMutation({
    mutationFn: async (id: string) => {
      setIsLoading(true);
      try {
        // In a real implementation, we would delete the user from Supabase Auth
        // and delete the corresponding admin record
        console.log(`Deleting admin ${id}`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({
        title: 'Administrateur supprimé',
        description: 'L\'administrateur a été supprimé avec succès',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur est survenue lors de la suppression",
        variant: 'destructive',
      });
    }
  });

  // Reset admin password
  const resetPassword = useMutation({
    mutationFn: async (email: string) => {
      setIsLoading(true);
      try {
        // In a real implementation, we would trigger a password reset email
        console.log(`Sending password reset to ${email}`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Lien de réinitialisation envoyé',
        description: 'Un email de réinitialisation de mot de passe a été envoyé',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur est survenue lors de l'envoi",
        variant: 'destructive',
      });
    }
  });

  return {
    admins: admins || [],
    isLoading,
    refetch,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    resetPassword
  };
}

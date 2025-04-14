
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SfdFormValues } from '@/components/admin/sfd/schemas/sfdFormSchema';

export interface SFD {
  id: string;
  name: string;
  code: string;
  region: string;
  status: 'active' | 'inactive' | 'suspended';
  contact_email: string;
  phone: string;
  description?: string;
  created_at: string;
  logo_url?: string;
  client_count: number;
  loan_count: number;
}

export function useSfdManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch SFDs from Supabase
  const { data: sfds, refetch } = useQuery({
    queryKey: ['sfds'],
    queryFn: async () => {
      try {
        const { data: sfdsData, error } = await supabase
          .from('sfds')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching SFDs:', error);
          throw error;
        }

        // Add client_count and loan_count with default values
        return (sfdsData || []).map(sfd => ({
          ...sfd,
          client_count: sfd.client_count || 0,
          loan_count: sfd.loan_count || 0
        }));
      } catch (error) {
        console.error('Error fetching SFDs:', error);
        return [];
      }
    }
  });

  // Create SFD
  const createSfd = useMutation({
    mutationFn: async (sfdData: SfdFormValues) => {
      setIsLoading(true);
      try {
        console.log('Creating SFD with data:', sfdData);
        
        const { data, error } = await supabase
          .from('sfds')
          .insert([{
            name: sfdData.name,
            code: sfdData.code,
            region: sfdData.region,
            status: sfdData.status || 'active',
            contact_email: sfdData.contact_email,
            phone: sfdData.phone,
            description: sfdData.description,
            logo_url: sfdData.logo_url
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD créée',
        description: 'La SFD a été créée avec succès',
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

  // Update SFD
  const updateSfd = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SfdFormValues> }) => {
      setIsLoading(true);
      try {
        const { data: updatedSfd, error } = await supabase
          .from('sfds')
          .update({
            name: data.name,
            code: data.code,
            region: data.region,
            status: data.status,
            contact_email: data.contact_email,
            phone: data.phone,
            description: data.description,
            logo_url: data.logo_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return updatedSfd;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD mise à jour',
        description: 'La SFD a été mise à jour avec succès',
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

  // Suspend SFD
  const suspendSfd = useMutation({
    mutationFn: async (id: string) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sfds')
          .update({ status: 'suspended', updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD suspendue',
        description: 'La SFD a été suspendue avec succès',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur est survenue lors de la suspension",
        variant: 'destructive',
      });
    }
  });

  // Reactivate SFD
  const reactivateSfd = useMutation({
    mutationFn: async (id: string) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sfds')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD réactivée',
        description: 'La SFD a été réactivée avec succès',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur est survenue lors de la réactivation",
        variant: 'destructive',
      });
    }
  });

  return {
    sfds: sfds || [],
    isLoading,
    refetch,
    createSfd,
    updateSfd,
    suspendSfd,
    reactivateSfd
  };
}

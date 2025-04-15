import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sfd } from '../types/sfd-types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define and export the SFD interface that's used by components
export interface SFD {
  id: string;
  name: string;
  code: string;
  region?: string;  // Changed from 'region: string' to 'region?: string' to make it optional
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  contact_email?: string;
  phone?: string;
  description?: string;
  logo_url?: string | null;
  legal_document_url?: string | null;
  created_at: string;
  updated_at?: string;
  client_count?: number;
  loan_count?: number;
}

export function useSfdManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSfd, setSelectedSfd] = useState<Sfd | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all SFDs
  const { 
    data: sfds = [], 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['sfds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Sfd[];
    }
  });

  // Filter SFDs based on search term
  const filteredSfds = sfds.filter(sfd => 
    sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sfd.code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (sfd.region && sfd.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Activate SFD mutation
  const activateSfdMutation = useMutation({
    mutationFn: async (sfdId: string) => {
      console.log(`Attempting to activate SFD with ID: ${sfdId}`);
      
      const { data, error } = await supabase
        .from('sfds')
        .update({ status: 'active' })
        .eq('id', sfdId)
        .select()
        .single();

      if (error) {
        console.error('Error activating SFD:', error);
        throw error;
      }

      console.log('SFD activation successful:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['active-sfds'] });
      
      toast({
        title: "SFD Activée",
        description: "La SFD a été activée avec succès",
      });
    },
    onError: (error: any) => {
      console.error('Activation failed:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer la SFD",
        variant: "destructive"
      });
    }
  });

  const handleActivateSfd = useCallback(async (sfdId: string) => {
    try {
      await activateSfdMutation.mutateAsync(sfdId);
    } catch (error) {
      console.error('Error in handleActivateSfd:', error);
    }
  }, [activateSfdMutation]);

  return {
    sfds,
    filteredSfds,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    handleActivateSfd,
    activateSfdMutation,
    refetch
  };
}

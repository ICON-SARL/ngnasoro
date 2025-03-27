
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sfd } from '../types/sfd-types';

export function useSfdManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSfd, setSelectedSfd] = useState<Sfd | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);

  // Fetch SFDs from Supabase
  const { data: sfds, isLoading, isError } = useQuery({
    queryKey: ['sfds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Sfd[];
    },
  });

  // Mutation to suspend a SFD
  const suspendSfdMutation = useMutation({
    mutationFn: async (sfdId: string) => {
      const { data, error } = await supabase
        .from('sfds')
        .update({ status: 'suspended' })
        .eq('id', sfdId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD suspendu',
        description: `Le compte SFD a été suspendu avec succès.`,
      });
      setShowSuspendDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to reactivate a SFD
  const reactivateSfdMutation = useMutation({
    mutationFn: async (sfdId: string) => {
      const { data, error } = await supabase
        .from('sfds')
        .update({ status: 'active' })
        .eq('id', sfdId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD réactivé',
        description: `Le compte SFD a été réactivé avec succès.`,
      });
      setShowReactivateDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSuspendSfd = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowSuspendDialog(true);
  };

  const handleReactivateSfd = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowReactivateDialog(true);
  };

  return {
    sfds,
    isLoading,
    isError,
    selectedSfd,
    showSuspendDialog,
    setShowSuspendDialog,
    showReactivateDialog,
    setShowReactivateDialog,
    suspendSfdMutation,
    reactivateSfdMutation,
    handleSuspendSfd,
    handleReactivateSfd
  };
}


import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sfd } from '../types/sfd-types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSuspendSfdMutation } from './sfd-management/mutations/useSuspendSfdMutation';
import { useReactivateSfdMutation } from './sfd-management/mutations/useReactivateSfdMutation';
import { useActivateSfdMutation } from './sfd-management/mutations/useActivateSfdMutation';

export function useSfdManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSfd, setSelectedSfd] = useState<Sfd | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
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
      try {
        const { data, error } = await supabase
          .from('sfds')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        return data as Sfd[];
      } catch (err: any) {
        console.error('Error fetching SFDs:', err);
        throw err;
      }
    }
  });

  const forceRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Filter SFDs based on search term
  const filteredSfds = sfds.filter(sfd => 
    sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sfd.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (sfd.region && sfd.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Mutations
  const suspendSfdMutation = useSuspendSfdMutation();
  const reactivateSfdMutation = useReactivateSfdMutation();
  const activateSfdMutation = useActivateSfdMutation();

  // Add SFD mutation
  const addSfdMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { data, error } = await supabase
        .from('sfds')
        .insert({
          name: formData.name,
          code: formData.code,
          region: formData.region,
          status: 'pending', // Default status for new SFDs
          contact_email: formData.email,
          phone: formData.phone,
          description: formData.description
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: "SFD ajouté",
        description: "Le SFD a été ajouté avec succès."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Edit SFD mutation
  const editSfdMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { data, error } = await supabase
        .from('sfds')
        .update({
          name: formData.name,
          code: formData.code,
          region: formData.region,
          contact_email: formData.email,
          phone: formData.phone,
          description: formData.description
        })
        .eq('id', formData.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: "SFD modifié",
        description: "Le SFD a été modifié avec succès."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Handler for suspending an SFD
  const handleSuspendSfd = useCallback((sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowSuspendDialog(true);
  }, []);

  // Handler for reactivating an SFD
  const handleReactivateSfd = useCallback((sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowReactivateDialog(true);
  }, []);

  // Handler for activating a pending SFD
  const handleActivateSfd = useCallback((sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowActivateDialog(true);
  }, []);

  // Handler for showing edit dialog
  const handleShowEditDialog = useCallback((sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowEditDialog(true);
  }, []);

  // Handler for adding new SFD
  const handleAddSfd = useCallback((formData: any) => {
    addSfdMutation.mutate(formData);
    setShowAddDialog(false);
  }, [addSfdMutation]);

  // Handler for editing SFD
  const handleEditSfd = useCallback((formData: any) => {
    editSfdMutation.mutate(formData);
    setShowEditDialog(false);
  }, [editSfdMutation]);

  return {
    filteredSfds,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    selectedSfd,
    handleShowEditDialog,
    handleSuspendSfd,
    handleReactivateSfd,
    handleActivateSfd,
    showSuspendDialog,
    setShowSuspendDialog,
    showReactivateDialog,
    setShowReactivateDialog,
    showActivateDialog,
    setShowActivateDialog,
    showAddDialog,
    setShowAddDialog,
    showEditDialog,
    setShowEditDialog,
    suspendSfdMutation,
    reactivateSfdMutation,
    activateSfdMutation,
    addSfdMutation,
    editSfdMutation,
    handleAddSfd,
    handleEditSfd,
    forceRefresh
  };
}

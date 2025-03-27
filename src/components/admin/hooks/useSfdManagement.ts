
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sfd } from '../types/sfd-types';
import { SfdFormValues } from '../sfd/SfdForm';
import { useFinancialExport } from '@/hooks/useFinancialExport';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/auditLogger';
import { useAuth } from '@/hooks/useAuth';

export function useSfdManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { exportToPDF, exportToExcel, isExporting } = useFinancialExport();
  
  // Local state
  const [selectedSfd, setSelectedSfd] = useState<Sfd | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Add SFD mutation
  const addSfdMutation = useMutation({
    mutationFn: async (sfdData: SfdFormValues) => {
      const { data, error } = await supabase
        .from('sfds')
        .insert([sfdData])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD ajoutée',
        description: 'La nouvelle SFD a été ajoutée avec succès.',
      });
      setShowAddDialog(false);

      // Log audit event
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'create_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          details: { sfd_name: selectedSfd?.name },
          status: 'success',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });

      // Log audit event for failure
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'create_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          details: { error: error.message },
          status: 'failure',
          error_message: error.message,
        });
      }
    },
  });

  // Edit SFD mutation
  const editSfdMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SfdFormValues }) => {
      const { data: updatedData, error } = await supabase
        .from('sfds')
        .update(data)
        .eq('id', id)
        .select();

      if (error) throw error;
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD modifiée',
        description: 'Les informations de la SFD ont été mises à jour avec succès.',
      });
      setShowEditDialog(false);

      // Log audit event
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'update_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          details: { sfd_id: selectedSfd?.id, sfd_name: selectedSfd?.name },
          status: 'success',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });

      // Log audit event for failure
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'update_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          details: { sfd_id: selectedSfd?.id, error: error.message },
          status: 'failure',
          error_message: error.message,
        });
      }
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
        title: 'SFD suspendue',
        description: `Le compte SFD a été suspendu avec succès.`,
      });
      setShowSuspendDialog(false);

      // Log audit event
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'suspend_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.WARNING,
          details: { sfd_id: selectedSfd?.id, sfd_name: selectedSfd?.name },
          status: 'success',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });

      // Log audit event for failure
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'suspend_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          details: { sfd_id: selectedSfd?.id, error: error.message },
          status: 'failure',
          error_message: error.message,
        });
      }
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
        title: 'SFD réactivée',
        description: `Le compte SFD a été réactivé avec succès.`,
      });
      setShowReactivateDialog(false);

      // Log audit event
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'reactivate_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.INFO,
          details: { sfd_id: selectedSfd?.id, sfd_name: selectedSfd?.name },
          status: 'success',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });

      // Log audit event for failure
      if (user) {
        logAuditEvent({
          user_id: user.id,
          action: 'reactivate_sfd',
          category: AuditLogCategory.SFD_OPERATIONS,
          severity: AuditLogSeverity.ERROR,
          details: { sfd_id: selectedSfd?.id, error: error.message },
          status: 'failure',
          error_message: error.message,
        });
      }
    },
  });

  // Filter SFDs based on search term and status filter
  const filteredSfds = useMemo(() => {
    if (!sfds) return [];
    
    return sfds.filter((sfd) => {
      const matchesSearch = 
        sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sfd.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sfd.region && sfd.region.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus =
        statusFilter === 'all' ||
        sfd.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [sfds, searchTerm, statusFilter]);

  // Handle export to PDF
  const handleExportPdf = useCallback(() => {
    if (!filteredSfds.length) return;
    
    const sfdData = filteredSfds.map(sfd => ({
      ID: sfd.id,
      Nom: sfd.name,
      Code: sfd.code,
      Région: sfd.region || '-',
      Statut: sfd.status || 'active',
      'Date de création': new Date(sfd.created_at).toLocaleDateString(),
    }));
    
    exportToPDF(sfdData, {
      fileName: `sfds-export-${new Date().toISOString().split('T')[0]}`,
      title: 'Liste des SFDs',
      subtitle: `Généré le ${new Date().toLocaleDateString()}`
    });

    // Log audit event
    if (user) {
      logAuditEvent({
        user_id: user.id,
        action: 'export_sfds_pdf',
        category: AuditLogCategory.DATA_ACCESS,
        severity: AuditLogSeverity.INFO,
        details: { count: filteredSfds.length, filter: statusFilter },
        status: 'success',
      });
    }
  }, [filteredSfds, exportToPDF, statusFilter, user]);

  // Handle export to Excel
  const handleExportExcel = useCallback(() => {
    if (!filteredSfds.length) return;
    
    const sfdData = filteredSfds.map(sfd => ({
      ID: sfd.id,
      Nom: sfd.name,
      Code: sfd.code,
      Région: sfd.region || '-',
      Statut: sfd.status || 'active',
      'Date de création': new Date(sfd.created_at).toLocaleDateString(),
    }));
    
    exportToExcel(sfdData, {
      fileName: `sfds-export-${new Date().toISOString().split('T')[0]}`,
      title: 'Liste des SFDs',
    });

    // Log audit event
    if (user) {
      logAuditEvent({
        user_id: user.id,
        action: 'export_sfds_excel',
        category: AuditLogCategory.DATA_ACCESS,
        severity: AuditLogSeverity.INFO,
        details: { count: filteredSfds.length, filter: statusFilter },
        status: 'success',
      });
    }
  }, [filteredSfds, exportToExcel, statusFilter, user]);

  // Event handlers
  const handleAddSfd = (formData: SfdFormValues) => {
    addSfdMutation.mutate(formData);
  };

  const handleEditSfd = (formData: SfdFormValues) => {
    if (selectedSfd) {
      editSfdMutation.mutate({ id: selectedSfd.id, data: formData });
    }
  };

  const handleShowEditDialog = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowEditDialog(true);
  };

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
    filteredSfds,
    isLoading,
    isError,
    isExporting,
    selectedSfd,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showSuspendDialog,
    setShowSuspendDialog,
    showReactivateDialog,
    setShowReactivateDialog,
    showAddDialog,
    setShowAddDialog,
    showEditDialog,
    setShowEditDialog,
    suspendSfdMutation,
    reactivateSfdMutation,
    addSfdMutation,
    editSfdMutation,
    handleAddSfd,
    handleEditSfd,
    handleShowEditDialog,
    handleSuspendSfd,
    handleReactivateSfd,
    handleExportPdf,
    handleExportExcel
  };
}


import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { merefTransactionService } from '@/services/meref/merefTransactionService';

export interface MerefLoanRequest {
  id: string;
  sfd_id: string;
  sfd_name?: string;
  client_id: string;
  client_name?: string;
  amount: number;
  purpose: string;
  duration_months: number;
  created_at: string;
  submitted_at?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'disbursed';
  meref_status?: 'pending' | 'approved' | 'rejected';
  meref_reference?: string;
  meref_feedback?: string;
}

export function useMerefLoanRequests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  const [filteredRequests, setFilteredRequests] = useState<MerefLoanRequest[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    minAmount: '',
    maxAmount: ''
  });

  // Fetch all loan requests
  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ['meref-loan-requests'],
    queryFn: async () => {
      try {
        console.log("Récupération des demandes de prêt MEREF...");
        
        const { data, error } = await supabase
          .from('meref_loan_requests')
          .select(`
            id,
            amount,
            purpose,
            duration_months,
            status,
            meref_status,
            meref_reference,
            meref_feedback,
            created_at,
            submitted_at,
            sfd_id,
            client_id
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Erreur lors de la récupération des demandes de prêt:", error);
          throw error;
        }

        // Jointure manuelle avec les SFDs et clients pour plus de robustesse
        const sfdIds = data.map(item => item.sfd_id).filter(Boolean);
        const clientIds = data.map(item => item.client_id).filter(Boolean);
        
        let sfdsMap: Record<string, string> = {};
        let clientsMap: Record<string, string> = {};
        
        if (sfdIds.length > 0) {
          const { data: sfdsData } = await supabase
            .from('sfds')
            .select('id, name')
            .in('id', sfdIds);
            
          if (sfdsData) {
            sfdsMap = sfdsData.reduce((acc, sfd) => {
              acc[sfd.id] = sfd.name;
              return acc;
            }, {} as Record<string, string>);
          }
        }
        
        if (clientIds.length > 0) {
          const { data: clientsData } = await supabase
            .from('sfd_clients')
            .select('id, full_name')
            .in('id', clientIds);
            
          if (clientsData) {
            clientsMap = clientsData.reduce((acc, client) => {
              acc[client.id] = client.full_name;
              return acc;
            }, {} as Record<string, string>);
          }
        }
        
        // Formater les données
        const formattedData = data.map(item => ({
          id: item.id,
          sfd_id: item.sfd_id,
          sfd_name: sfdsMap[item.sfd_id] || 'SFD inconnue',
          client_id: item.client_id,
          client_name: clientsMap[item.client_id] || 'Client inconnu',
          amount: item.amount,
          purpose: item.purpose,
          duration_months: item.duration_months,
          created_at: item.created_at,
          submitted_at: item.submitted_at,
          status: item.status,
          meref_status: item.meref_status,
          meref_reference: item.meref_reference,
          meref_feedback: item.meref_feedback
        }));

        return formattedData;
      } catch (error) {
        console.error('Erreur lors de la récupération des demandes de prêt MEREF:', error);
        return [];
      }
    },
    refetchOnWindowFocus: false
  });

  // Approuver une demande de prêt
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string, comments?: string }) => {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .update({
          status: 'approved',
          meref_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
          meref_feedback: comments
        })
        .eq('id', requestId)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Demande approuvée",
        description: "La demande de prêt a été approuvée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['meref-loan-requests'] });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Une erreur est survenue lors de l'approbation";
      console.error("Erreur:", errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Rejeter une demande de prêt
  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string, comments?: string }) => {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .update({
          status: 'rejected',
          meref_status: 'rejected',
          meref_feedback: comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Demande rejetée",
        description: "La demande de prêt a été rejetée",
      });
      queryClient.invalidateQueries({ queryKey: ['meref-loan-requests'] });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Une erreur est survenue lors du rejet";
      console.error("Erreur:", errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Décaisser un prêt approuvé
  const disburseMutation = useMutation({
    mutationFn: async (requestId: string) => {
      // Récupérer d'abord les détails de la demande
      const { data: request, error: requestError } = await supabase
        .from('meref_loan_requests')
        .select('*')
        .eq('id', requestId)
        .single();
        
      if (requestError) throw requestError;
      
      // Effectuer le décaissement via le service de transaction
      const result = await merefTransactionService.disburseLoanRequest(
        requestId,
        request.amount,
        request.sfd_id,
        request.client_id
      );
      
      if (!result) {
        throw new Error("Échec du décaissement du prêt");
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Prêt décaissé",
        description: "Le prêt a été décaissé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['meref-loan-requests'] });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Une erreur est survenue lors du décaissement";
      console.error("Erreur:", errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Récupérer les détails d'une demande par ID
  const getLoanRequestById = useCallback(async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .select(`
          *,
          sfds:sfd_id(id, name, region),
          clients:client_id(id, full_name, email, phone)
        `)
        .eq('id', requestId)
        .single();
        
      if (error) throw error;
      
      // Récupérer également les transactions associées
      const transactions = await merefTransactionService.getTransactionsByLoanRequestId(requestId);
      
      return {
        ...data,
        sfd_name: data.sfds?.name,
        client_name: data.clients?.full_name,
        client_email: data.clients?.email,
        client_phone: data.clients?.phone,
        transactions
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la demande:', error);
      return null;
    }
  }, []);

  // Filtre les demandes en fonction des critères
  const applyFilters = useCallback(() => {
    if (!requests) return;
    
    let filtered = [...requests];
    
    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(req => 
        req.client_name?.toLowerCase().includes(searchLower) ||
        req.sfd_name?.toLowerCase().includes(searchLower) ||
        req.purpose.toLowerCase().includes(searchLower) ||
        (req.meref_reference && req.meref_reference.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      if (!isNaN(min)) {
        filtered = filtered.filter(req => req.amount >= min);
      }
    }
    
    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      if (!isNaN(max)) {
        filtered = filtered.filter(req => req.amount <= max);
      }
    }
    
    setFilteredRequests(filtered);
  }, [requests, filters]);

  // Mettre à jour les filtres
  const updateFilter = useCallback((key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      status: '',
      search: '',
      minAmount: '',
      maxAmount: ''
    });
  }, []);

  // Appliquer les filtres à chaque fois qu'ils changent
  useEffect(() => {
    applyFilters();
  }, [filters, requests, applyFilters]);

  return {
    requests: filteredRequests,
    allRequests: requests || [],
    isLoading,
    isError,
    refetch,
    filters,
    updateFilter,
    resetFilters,
    approveRequest: (requestId: string, comments?: string) => 
      approveMutation.mutate({ requestId, comments }),
    rejectRequest: (requestId: string, comments?: string) => 
      rejectMutation.mutate({ requestId, comments }),
    disburseRequest: (requestId: string) => 
      disburseMutation.mutate(requestId),
    getLoanRequestById
  };
}

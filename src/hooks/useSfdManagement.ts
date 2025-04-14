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

  // Mock data for SFDs
  const mockSfds: SFD[] = [
    {
      id: "sfd1",
      name: "RCPB Ouagadougou",
      code: "RCPB-OUA",
      region: "Centre",
      status: "active",
      contact_email: "contact@rcpb.org",
      phone: "+226 70123456",
      description: "Réseau des Caisses Populaires du Burkina - Agence de Ouagadougou",
      created_at: "2022-01-15T08:30:00Z",
      client_count: 1250,
      loan_count: 380
    },
    {
      id: "sfd2",
      name: "Microcred Abidjan",
      code: "MC-ABJ",
      region: "Lagunes",
      status: "active",
      contact_email: "info@microcred.ci",
      phone: "+225 27213456",
      description: "Institution de microfinance basée à Abidjan",
      created_at: "2022-03-20T10:15:00Z",
      client_count: 980,
      loan_count: 210
    }
  ];

  // Fetch SFDs
  const fetchSfds = async (): Promise<SFD[]> => {
    try {
      // In a real implementation, we would fetch from Supabase
      // For now, return mock data
      return mockSfds;
    } catch (error) {
      console.error('Error fetching SFDs:', error);
      return [];
    }
  };

  // Use React Query to manage the data fetching
  const { data: sfds, refetch } = useQuery({
    queryKey: ['sfds'],
    queryFn: fetchSfds,
    initialData: mockSfds
  });

  // Create SFD
  const createSfd = useMutation({
    mutationFn: async (sfdData: SfdFormValues) => {
      setIsLoading(true);
      try {
        // In a real implementation, we would insert into Supabase
        console.log(`Creating SFD with data:`, sfdData);
        
        // Ensure required fields are present
        if (!sfdData.name || !sfdData.code) {
          throw new Error("Name and code are required fields");
        }
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { 
          success: true, 
          sfd: {
            ...sfdData,
            id: `sfd${Date.now()}`,
            status: sfdData.status || 'active',
            created_at: new Date().toISOString(),
            client_count: 0,
            loan_count: 0
          } 
        };
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
        // In a real implementation, we would update in Supabase
        console.log(`Updating SFD ${id} with data:`, data);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
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
        // In a real implementation, we would update in Supabase
        console.log(`Suspending SFD ${id}`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
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
        // In a real implementation, we would update in Supabase
        console.log(`Reactivating SFD ${id}`);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return { success: true };
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

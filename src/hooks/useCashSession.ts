import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useCashSession() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeSessions, isLoading } = useQuery({
    queryKey: ['cash-sessions-active', activeSfdId, user?.id],
    queryFn: async () => {
      if (!activeSfdId || !user?.id) return [];
      const { data, error } = await supabase
        .from('cash_sessions' as any)
        .select('*')
        .eq('sfd_id', activeSfdId)
        .eq('cashier_id', user.id)
        .eq('status', 'open')
        .order('opened_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!activeSfdId && !!user?.id,
  });

  const { data: cashOperations } = useQuery({
    queryKey: ['cash-operations', activeSfdId, (activeSessions?.[0] as any)?.id],
    queryFn: async () => {
      const sessionId = (activeSessions?.[0] as any)?.id;
      if (!activeSfdId || !sessionId) return [];
      const { data, error } = await supabase
        .from('cash_operations' as any)
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!activeSfdId && !!(activeSessions?.[0] as any)?.id,
  });

  const openSession = useMutation({
    mutationFn: async (initialAmount: number) => {
      const { data, error } = await supabase.functions.invoke('open-cash-session', {
        body: { initialAmount, sfdId: activeSfdId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-sessions-active'] });
      toast({
        title: 'Succès',
        description: 'Session de caisse ouverte',
      });
    },
  });

  const closeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.functions.invoke('close-cash-session', {
        body: { sessionId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-sessions-active'] });
      toast({
        title: 'Succès',
        description: 'Session de caisse fermée',
      });
    },
  });

  return {
    activeSession: (activeSessions?.[0] as any) || null,
    cashOperations,
    isLoading,
    openSession,
    closeSession,
  };
}

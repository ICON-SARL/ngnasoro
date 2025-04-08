
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminCommunication } from '@/hooks/useAdminCommunication';

export const useSfdApproval = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { sendNotification } = useAdminCommunication();

  const approveSfd = useMutation({
    mutationFn: async ({ sfdId, sfdName }: { sfdId: string; sfdName: string }) => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Approving SFD:", { sfdId, sfdName });
        
        // 1. Update SFD status
        const { error: updateError } = await supabase
          .from('sfds')
          .update({ status: 'active' })
          .eq('id', sfdId);
          
        if (updateError) {
          console.error("Error updating SFD status:", updateError);
          throw updateError;
        }
        
        // 2. Update client statuses
        const { error: clientsError } = await supabase
          .from('sfd_clients')
          .update({ status: 'validated' })
          .eq('sfd_id', sfdId)
          .eq('status', 'pending');
          
        if (clientsError) {
          console.warn("Error updating client statuses:", clientsError);
          // Non-critical, continue
        }
        
        // 3. Send notification to SFD admins
        try {
          // Get SFD admins
          const { data: sfdAdmins } = await supabase
            .from('user_sfds')
            .select('user_id')
            .eq('sfd_id', sfdId);
            
          if (sfdAdmins && sfdAdmins.length > 0) {
            // Send notification to each admin
            for (const admin of sfdAdmins) {
              await sendNotification({
                title: "SFD approuvée",
                message: `Votre SFD "${sfdName}" a été approuvée et est maintenant active.`,
                type: "success",
                recipient_id: admin.user_id
              });
            }
          } else {
            // Send to admin role
            await sendNotification({
              title: "SFD approuvée",
              message: `La SFD "${sfdName}" a été approuvée et est maintenant active.`,
              type: "success",
              recipient_role: "admin"
            });
          }
        } catch (notifError) {
          console.warn("Error sending notifications:", notifError);
          // Non-critical, continue
        }
        
        return { success: true, sfdId, sfdName };
      } catch (error: any) {
        console.error("Error approving SFD:", error);
        setError(error.message || "Une erreur est survenue lors de l'approbation de la SFD");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-requests'] });
      
      toast({
        title: "SFD approuvée",
        description: `La SFD ${data.sfdName} a été approuvée avec succès.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'approbation de la SFD",
        variant: "destructive",
      });
    }
  });

  const rejectSfd = useMutation({
    mutationFn: async ({ sfdId, sfdName, reason }: { sfdId: string; sfdName: string; reason: string }) => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Rejecting SFD:", { sfdId, sfdName, reason });
        
        // 1. Update SFD status
        const { error: updateError } = await supabase
          .from('sfds')
          .update({ status: 'rejected' })
          .eq('id', sfdId);
          
        if (updateError) {
          console.error("Error updating SFD status:", updateError);
          throw updateError;
        }
        
        // 2. Send notification to SFD admins
        try {
          // Get SFD admins
          const { data: sfdAdmins } = await supabase
            .from('user_sfds')
            .select('user_id')
            .eq('sfd_id', sfdId);
            
          if (sfdAdmins && sfdAdmins.length > 0) {
            // Send notification to each admin
            for (const admin of sfdAdmins) {
              await sendNotification({
                title: "SFD rejetée",
                message: `Votre SFD "${sfdName}" a été rejetée. Raison: ${reason}`,
                type: "error",
                recipient_id: admin.user_id
              });
            }
          } else {
            // Send to admin role
            await sendNotification({
              title: "SFD rejetée",
              message: `La SFD "${sfdName}" a été rejetée. Raison: ${reason}`,
              type: "error",
              recipient_role: "admin"
            });
          }
        } catch (notifError) {
          console.warn("Error sending notifications:", notifError);
          // Non-critical, continue
        }
        
        return { success: true, sfdId, sfdName };
      } catch (error: any) {
        console.error("Error rejecting SFD:", error);
        setError(error.message || "Une erreur est survenue lors du rejet de la SFD");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-requests'] });
      
      toast({
        title: "SFD rejetée",
        description: `La SFD ${data.sfdName} a été rejetée.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du rejet de la SFD",
        variant: "destructive",
      });
    }
  });

  return {
    approveSfd: approveSfd.mutate,
    rejectSfd: rejectSfd.mutate,
    isLoading: approveSfd.isPending || rejectSfd.isPending,
    error
  };
};

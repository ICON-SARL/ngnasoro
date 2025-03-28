
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminCommunication } from './useAdminCommunication';
import { Sfd } from '@/components/admin/types/sfd-types';

export function useSfdApproval() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { sendNotification } = useAdminCommunication();
  
  // Approve an SFD application
  const approveSfdMutation = useMutation({
    mutationFn: async ({ 
      sfdId, 
      comments 
    }: { 
      sfdId: string; 
      comments?: string;
    }) => {
      setIsLoading(true);
      try {
        // Update SFD status to active in database
        const { data, error } = await supabase
          .from('sfds')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', sfdId)
          .select()
          .single();
          
        if (error) throw error;
        
        // Create audit log entry
        await supabase
          .from('audit_logs')
          .insert({
            category: 'sfd_management',
            action: 'sfd_approved',
            status: 'success',
            target_resource: `sfds/${sfdId}`,
            details: {
              comments,
            },
            severity: 'info',
          });
        
        // Send notification to SFD admin
        await sendNotification({
          title: "Demande d'adhésion approuvée",
          message: `Votre SFD a été approuvée sur la plateforme NGNA SÔRÔ! Vous pouvez maintenant accéder à toutes les fonctionnalités.`,
          type: 'info',
          recipient_role: 'sfd_admin',
          action_link: '/sfd-dashboard'
        });
        
        return data as Sfd;
      } catch (error) {
        console.error('Error approving SFD:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      
      toast({
        title: "SFD approuvé",
        description: "Le SFD a été approuvé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'approbation",
        description: error.message || "Une erreur est survenue lors de l'approbation du SFD",
        variant: "destructive",
      });
    }
  });
  
  // Reject an SFD application
  const rejectSfdMutation = useMutation({
    mutationFn: async ({ 
      sfdId, 
      reason, 
      comments 
    }: { 
      sfdId: string; 
      reason: string;
      comments?: string;
    }) => {
      setIsLoading(true);
      try {
        // Update SFD status to rejected in database
        const { data, error } = await supabase
          .from('sfds')
          .update({
            status: 'suspended',
            updated_at: new Date().toISOString(),
          })
          .eq('id', sfdId)
          .select()
          .single();
          
        if (error) throw error;
        
        // Create audit log entry
        await supabase
          .from('audit_logs')
          .insert({
            category: 'sfd_management',
            action: 'sfd_rejected',
            status: 'success',
            target_resource: `sfds/${sfdId}`,
            details: {
              reason,
              comments,
            },
            severity: 'warning',
          });
        
        // Send notification to SFD admin
        await sendNotification({
          title: "Demande d'adhésion rejetée",
          message: `Votre demande d'adhésion à NGNA SÔRÔ! a été rejetée pour la raison suivante: ${reason}${comments ? `. ${comments}` : ''}`,
          type: 'warning',
          recipient_role: 'sfd_admin',
        });
        
        return data as Sfd;
      } catch (error) {
        console.error('Error rejecting SFD:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      
      toast({
        title: "SFD rejeté",
        description: "Le SFD a été rejeté avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de rejet",
        description: error.message || "Une erreur est survenue lors du rejet du SFD",
        variant: "destructive",
      });
    }
  });

  return {
    approveSfdMutation,
    rejectSfdMutation,
    isLoading
  };
}

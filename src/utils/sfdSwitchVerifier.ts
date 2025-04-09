
import { supabase } from "@/integrations/supabase/client";

interface VerificationRequest {
  userId: string;
  sfdId: string;
  verificationCode?: string;
}

interface VerificationResponse {
  success: boolean;
  requiresVerification: boolean;
  requiresApproval?: boolean;
  verificationId?: string;
  message: string;
  verificationCode?: string; // Only for demo purposes
}

/**
 * Check if a user can switch to a specific SFD
 * Returns whether verification is required
 */
export async function verifySfdSwitch(userId: string, sfdId: string): Promise<VerificationResponse> {
  try {
    // Vérifier le rôle de l'utilisateur
    const { data: authUser } = await supabase.auth.getUser();
    const userRole = authUser.user?.app_metadata?.role;
    
    // Si c'est un admin SFD avec une SFD déjà associée, il ne peut pas changer
    if (userRole === 'sfd_admin' && authUser.user?.app_metadata?.sfd_id) {
      return {
        success: false,
        requiresVerification: false,
        message: "En tant qu'administrateur SFD, vous ne pouvez pas changer de SFD"
      };
    }

    // Check if user has access to this SFD
    const { data: userSfd, error: userSfdError } = await supabase
      .from('user_sfds')
      .select('*')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .single();
    
    if (userSfdError || !userSfd) {
      // Check if there's a pending client request
      const { data: pendingClient, error: clientError } = await supabase
        .from('sfd_clients')
        .select('*')
        .eq('user_id', userId)
        .eq('sfd_id', sfdId)
        .eq('status', 'pending')
        .single();
      
      if (!clientError && pendingClient) {
        // If there's a pending request, inform the user
        return {
          success: false,
          requiresVerification: false,
          requiresApproval: true,
          message: "Votre demande d'accès à cette SFD est en cours de traitement"
        };
      }
      
      return {
        success: false,
        requiresVerification: false,
        message: "Vous n'avez pas accès à cette SFD"
      };
    }
    
    // Pour les clients: Déterminer si la SFD nécessite une vérification pour le changement
    // Pour les démonstrations, exiger une vérification si ce n'est pas la SFD par défaut
    if (userRole !== 'sfd_admin') {
      const requiresVerification = !userSfd.is_default;
      
      if (requiresVerification) {
        // Pour une sécurité renforcée, utiliser une fonction edge pour gérer la vérification
        const { data, error } = await supabase.functions.invoke('verify-sfd-switch', {
          body: {
            userId,
            sfdId,
            action: 'initiate'
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        return {
          success: true,
          requiresVerification: true,
          verificationId: data.verificationId,
          message: "Vérification requise pour changer de SFD",
          verificationCode: data.verificationCode // Dans une vraie application, cela serait envoyé par SMS
        };
      }
    }
    
    return {
      success: true,
      requiresVerification: false,
      message: "Changement de SFD autorisé sans vérification"
    };
  } catch (error) {
    console.error("Error verifying SFD switch:", error);
    return {
      success: false,
      requiresVerification: false,
      message: "Une erreur est survenue lors de la vérification"
    };
  }
}

/**
 * Complete the SFD switch after verification if required
 */
export async function completeSfdSwitch(
  request: VerificationRequest
): Promise<{ success: boolean; message: string }> {
  try {
    // Vérifier le rôle de l'utilisateur
    const { data: authUser } = await supabase.auth.getUser();
    const userRole = authUser.user?.app_metadata?.role;
    
    // Si c'est un admin SFD avec une SFD déjà associée, il ne peut pas changer
    if (userRole === 'sfd_admin' && authUser.user?.app_metadata?.sfd_id) {
      return {
        success: false,
        message: "En tant qu'administrateur SFD, vous ne pouvez pas changer de SFD"
      };
    }
  
    if (request.verificationCode) {
      // Verify the code through the edge function
      const { data, error } = await supabase.functions.invoke('verify-sfd-switch', {
        body: {
          userId: request.userId,
          sfdId: request.sfdId,
          verificationCode: request.verificationCode,
          action: 'verify'
        }
      });
      
      if (error || !data.success) {
        return {
          success: false,
          message: error?.message || data?.message || "Code de vérification invalide"
        };
      }
    }
    
    // Update the user's active SFD in their metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        sfd_id: request.sfdId
      }
    });
    
    if (error) {
      return {
        success: false,
        message: `Erreur lors du changement de SFD: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: "Changement de SFD effectué avec succès"
    };
  } catch (error: any) {
    console.error("Error completing SFD switch:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors du changement de SFD"
    };
  }
}

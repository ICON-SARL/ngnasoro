
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VerificationRequest {
  userId: string;
  sfdId: string;
  verificationCode?: string;
}

interface VerificationResponse {
  success: boolean;
  requiresVerification: boolean;
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
    // Check if user has access to this SFD
    const { data: userSfd, error: userSfdError } = await supabase
      .from('user_sfds')
      .select('*')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .single();
    
    if (userSfdError || !userSfd) {
      return {
        success: false,
        requiresVerification: false,
        message: "Vous n'avez pas accès à cette SFD"
      };
    }
    
    // Determine if this SFD requires verification for switching
    // For demonstration, let's require verification if it's not the default SFD
    const requiresVerification = !userSfd.is_default;
    
    if (requiresVerification) {
      // For enhanced security, use an edge function to handle verification
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
        verificationCode: data.verificationCode // In a real app, this would be sent via SMS
      };
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

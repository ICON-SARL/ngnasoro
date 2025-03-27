
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
      // Generate a verification ID that will be used to match with the verification code
      const verificationId = crypto.randomUUID();
      
      // In a real implementation, store this in a verifications table with an expiry time
      // and send the code to the user via SMS or email
      
      return {
        success: true,
        requiresVerification: true,
        verificationId,
        message: "Vérification requise pour changer de SFD"
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
    // In a real implementation, verify the verification code against the stored one
    // For demo, we'll assume the verification passed if a code was provided
    
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
    
    // In a real implementation, you might want to call an edge function 
    // to sync data or perform other backend tasks
    
    return {
      success: true,
      message: "Changement de SFD effectué avec succès"
    };
  } catch (error) {
    console.error("Error completing SFD switch:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors du changement de SFD"
    };
  }
}

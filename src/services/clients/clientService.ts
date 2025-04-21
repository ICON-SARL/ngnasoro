
import { supabase } from '@/integrations/supabase/client';
import { logAuditEvent } from '@/utils/audit';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

/**
 * Interface pour la création d'un client
 */
interface CreateClientInput {
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  sfd_id: string;
}

/**
 * Crée une demande d'adhésion à une SFD
 */
export const createClient = async (clientData: CreateClientInput): Promise<string | null> => {
  try {
    // Créer la demande d'adhésion
    const { data, error } = await supabase
      .from('client_adhesion_requests')
      .insert({
        full_name: clientData.full_name,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        sfd_id: clientData.sfd_id,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création de la demande d\'adhésion:', error);
      return null;
    }
    
    // Get current user for sender_id
    const { data: { user } } = await supabase.auth.getUser();
    const senderId = user?.id || 'system';
    
    // Notifier les administrateurs SFD
    await supabase
      .from('admin_notifications')
      .insert({
        title: 'Nouvelle demande d\'adhésion',
        message: `${clientData.full_name} a demandé à adhérer à votre SFD.`,
        type: 'client_adhesion',
        recipient_role: 'sfd_admin',
        sender_id: senderId
      });
    
    // Log de l'événement
    await logAuditEvent({
      user_id: senderId, // Adding the required user_id field
      action: "client_adhesion_requested",
      category: AuditLogCategory.USER_MANAGEMENT,
      severity: AuditLogSeverity.INFO,
      status: 'success',
      target_resource: `client_adhesion_requests/${data.id}`,
      details: { 
        client_name: clientData.full_name,
        sfd_id: clientData.sfd_id
      }
    });
    
    return data.id;
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    return null;
  }
};

/**
 * Approuve une demande d'adhésion
 */
export const approveAdhesion = async (clientId: string, adminId: string): Promise<boolean> => {
  try {
    // Récupérer les détails de la demande
    const { data: adhesion, error: adhesionError } = await supabase
      .from('client_adhesion_requests')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (adhesionError || !adhesion) {
      console.error('Erreur lors de la récupération de la demande d\'adhésion:', adhesionError);
      return false;
    }
    
    // Mettre à jour le statut de la demande
    const { error: updateError } = await supabase
      .from('client_adhesion_requests')
      .update({ 
        status: 'approved',
        processed_by: adminId,
        processed_at: new Date().toISOString()
      })
      .eq('id', clientId);
    
    if (updateError) {
      console.error('Erreur lors de la mise à jour de la demande d\'adhésion:', updateError);
      return false;
    }
    
    // Créer un client SFD
    const { data: client, error: clientError } = await supabase
      .from('sfd_clients')
      .insert({
        full_name: adhesion.full_name,
        email: adhesion.email,
        phone: adhesion.phone,
        address: adhesion.address,
        sfd_id: adhesion.sfd_id,
        status: 'validated',
        validated_by: adminId,
        validated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (clientError) {
      console.error('Erreur lors de la création du client SFD:', clientError);
      return false;
    }
    
    // Créer un compte pour le client
    await supabase
      .from('accounts')
      .insert({
        user_id: client.id,
        balance: 0,
        currency: 'FCFA'
      });
    
    // Notifier le client
    await supabase
      .from('admin_notifications')
      .insert({
        title: 'Demande d\'adhésion approuvée',
        message: `Votre demande d'adhésion a été approuvée. Bienvenue!`,
        type: 'client_adhesion_approved',
        recipient_id: client.id,
        sender_id: adminId
      });
    
    // Log de l'événement
    await logAuditEvent({
      user_id: adminId, // Adding the required user_id field
      action: "client_adhesion_approved",
      category: AuditLogCategory.USER_MANAGEMENT,
      severity: AuditLogSeverity.INFO,
      status: 'success',
      target_resource: `client_adhesion_requests/${clientId}`,
      details: { 
        client_id: client.id,
        client_name: adhesion.full_name,
        sfd_id: adhesion.sfd_id
      }
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'approbation de la demande d\'adhésion:', error);
    return false;
  }
};

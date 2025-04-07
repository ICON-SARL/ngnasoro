
import { supabase } from '@/integrations/supabase/client';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { logAuditEvent } from '@/utils/audit/auditLoggerCore';
import { useToast } from '@/hooks/use-toast';

/**
 * Récupère le solde du compte d'un client
 */
export async function getClientBalance(clientId: string): Promise<{ balance: number; currency: string }> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('balance, currency')
      .eq('user_id', clientId)
      .single();
      
    if (error) {
      console.error('Erreur lors de la récupération du solde:', error);
      return { balance: 0, currency: 'FCFA' };
    }
    
    return { 
      balance: data?.balance || 0, 
      currency: data?.currency || 'FCFA' 
    };
  } catch (error) {
    console.error('Échec de la récupération du solde:', error);
    return { balance: 0, currency: 'FCFA' };
  }
}

/**
 * Crédite le compte d'un client
 */
export async function creditClientAccount(params: {
  clientId: string;
  amount: number;
  adminId: string;
  description?: string;
}): Promise<boolean> {
  try {
    const { clientId, amount, adminId, description } = params;
    
    if (amount <= 0) {
      throw new Error("Le montant du crédit doit être supérieur à zéro");
    }

    // 1. Récupérer le solde actuel
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', clientId)
      .single();
      
    if (fetchError) {
      // Vérifier si le compte n'existe pas
      if (fetchError.code === 'PGRST116') {
        // Créer un nouveau compte si nécessaire
        const { error: insertError } = await supabase
          .from('accounts')
          .insert({
            user_id: clientId,
            balance: amount,
            currency: 'FCFA'
          });
        
        if (insertError) throw insertError;
      } else {
        throw fetchError;
      }
    } else {
      // 2. Mettre à jour le solde existant
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: account.balance + amount })
        .eq('user_id', clientId);
        
      if (updateError) throw updateError;
    }
    
    // 3. Créer une transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: clientId,
        amount: amount,
        type: 'deposit',
        name: description || 'Crédit de compte',
        description: description || 'Crédit de compte par administrateur SFD',
        status: 'success',
        payment_method: 'admin_credit'
      });
      
    if (transactionError) throw transactionError;
    
    // 4. Journaliser l'événement
    await logAuditEvent({
      category: AuditLogCategory.ADMIN_ACTION,
      action: 'client_account_credited',
      details: {
        clientId,
        amount,
        description
      },
      user_id: adminId,
      severity: AuditLogSeverity.INFO,
      status: 'success'
    });
    
    return true;
  } catch (error: any) {
    console.error('Échec du crédit de compte:', error);
    throw error;
  }
}

/**
 * Supprime un compte client
 */
export async function deleteClientAccount(params: {
  clientId: string;
  adminId: string;
  sfdId: string;
}): Promise<boolean> {
  try {
    const { clientId, adminId, sfdId } = params;
    
    // 1. Vérifier que le client appartient bien à cette SFD
    const { data: client, error: clientError } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('id', clientId)
      .eq('sfd_id', sfdId)
      .single();
      
    if (clientError || !client) {
      throw new Error("Client introuvable ou non associé à cette SFD");
    }
    
    // 2. Supprimer les documents du client
    const { error: docError } = await supabase
      .from('client_documents')
      .delete()
      .eq('client_id', clientId);
      
    if (docError) console.error("Erreur lors de la suppression des documents:", docError);
    
    // 3. Supprimer les activités du client
    const { error: activityError } = await supabase
      .from('client_activities')
      .delete()
      .eq('client_id', clientId);
      
    if (activityError) console.error("Erreur lors de la suppression des activités:", activityError);
    
    // 4. Supprimer les transactions associées
    const { error: transactionError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', clientId);
      
    if (transactionError) console.error("Erreur lors de la suppression des transactions:", transactionError);
    
    // 5. Supprimer le compte
    const { error: accountError } = await supabase
      .from('accounts')
      .delete()
      .eq('user_id', clientId);
      
    if (accountError) console.error("Erreur lors de la suppression du compte:", accountError);
    
    // 6. Supprimer le client lui-même
    const { error: deleteError } = await supabase
      .from('sfd_clients')
      .delete()
      .eq('id', clientId)
      .eq('sfd_id', sfdId);
      
    if (deleteError) throw deleteError;
    
    // 7. Journaliser l'événement
    await logAuditEvent({
      category: AuditLogCategory.ADMIN_ACTION,
      action: 'client_account_deleted',
      details: {
        clientId,
        sfdId
      },
      user_id: adminId,
      severity: AuditLogSeverity.WARNING,
      status: 'success'
    });
    
    return true;
  } catch (error: any) {
    console.error('Échec de la suppression du compte:', error);
    throw error;
  }
}

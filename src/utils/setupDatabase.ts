
import { supabase } from '@/integrations/supabase/client';

/**
 * Configure la base de données pour l'application
 * Initialise les tables et les paramètres nécessaires
 */
export async function setupDatabase() {
  try {
    // Journaliser le début de la configuration
    const { error } = await supabase.from('audit_logs').insert({
      action: 'setup_database',
      category: 'SYSTEM',
      status: 'success',
      severity: 'info',
      details: { message: 'Démarrage de la configuration de la base de données' }
    });
    
    if (error) {
      console.error('Erreur lors de la journalisation de configuration:', error);
      return false;
    }
    
    // Activer RLS sur toutes les tables
    await activateRlsForAllTables();
    
    // Synchroniser les rôles utilisateurs
    await synchronizeUserRoles();
    
    // Vérifier les comptes SFD
    await verifySfdAccounts();
    
    return true;
  } catch (err) {
    console.error('Exception lors de la configuration de la base de données:', err);
    return false;
  }
}

/**
 * Active Row Level Security (RLS) pour toutes les tables
 */
async function activateRlsForAllTables() {
  try {
    const tables = [
      'accounts',
      'admin_notifications',
      'admin_roles',
      'admin_users',
      'audit_logs',
      'client_activities',
      'client_adhesion_requests',
      'client_documents',
      'loan_activities',
      'loan_payments',
      'meref_loan_requests',
      'meref_request_activities',
      'meref_request_documents',
      'meref_settings',
      'mobile_money_settings',
      'mobile_money_webhooks',
      'profiles',
      'sfd_accounts',
      'sfd_clients',
      'sfd_loan_plans',
      'sfd_loans',
      'sfd_stats',
      'sfd_subsidies',
      'sfds',
      'subsidy_activities',
      'subsidy_alert_thresholds',
      'subsidy_request_activities',
      'subsidy_requests',
      'transaction_types',
      'transactions',
      'user_2fa',
      'user_roles',
      'user_sfds'
    ];
    
    // Appeler la fonction Edge pour activer RLS sur chaque table
    const { data, error } = await supabase.functions.invoke('synchronize-user-roles', {
      body: { 
        action: 'enable_rls',
        tables: tables
      }
    });
    
    if (error) {
      console.error('Erreur lors de l\'activation de RLS pour les tables:', error);
      return false;
    }
    
    console.log('Résultat de l\'activation RLS:', data);
    return true;
  } catch (err) {
    console.error('Exception lors de l\'activation de RLS:', err);
    return false;
  }
}

/**
 * Synchronise les rôles utilisateurs entre auth.users et user_roles
 */
export async function synchronizeUserRoles() {
  try {
    const { data, error } = await supabase.functions.invoke('synchronize-user-roles');
    
    if (error) {
      console.error('Erreur lors de la synchronisation des rôles:', error);
      return false;
    }
    
    console.log('Synchronisation des rôles réussie:', data);
    return true;
  } catch (err) {
    console.error('Exception lors de la synchronisation des rôles:', err);
    return false;
  }
}

/**
 * Vérifie que tous les comptes SFD sont correctement configurés
 */
async function verifySfdAccounts() {
  try {
    // Vérifier que chaque SFD a les comptes nécessaires
    const { data: sfds, error: sfdsError } = await supabase
      .from('sfds')
      .select('id, name');
      
    if (sfdsError) {
      console.error('Erreur lors de la récupération des SFDs:', sfdsError);
      return false;
    }
    
    for (const sfd of sfds) {
      // Vérifier si le SFD a les 3 types de comptes requis
      const { data: accounts, error: accountsError } = await supabase
        .from('sfd_accounts')
        .select('account_type')
        .eq('sfd_id', sfd.id);
        
      if (accountsError) {
        console.error(`Erreur lors de la vérification des comptes pour ${sfd.name}:`, accountsError);
        continue;
      }
      
      const accountTypes = accounts.map(a => a.account_type);
      const requiredTypes = ['operation', 'remboursement', 'epargne'];
      
      for (const type of requiredTypes) {
        if (!accountTypes.includes(type)) {
          // Créer le compte manquant
          await supabase
            .from('sfd_accounts')
            .insert({
              sfd_id: sfd.id,
              account_type: type,
              balance: 0,
              currency: 'FCFA',
              status: 'active'
            });
            
          console.log(`Compte de type ${type} créé pour ${sfd.name}`);
        }
      }
    }
    
    return true;
  } catch (err) {
    console.error('Exception lors de la vérification des comptes SFD:', err);
    return false;
  }
}

import { supabase } from '@/integrations/supabase/client';
import { NotificationData } from '@/types/notificationTypes';
import { LucideIcon } from 'lucide-react';

/**
 * Crée une notification dans la base de données
 */
export const createNotification = async (data: NotificationData): Promise<void> => {
  try {
    const { error } = await supabase
      .from('admin_notifications')
      .insert({
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        action_url: data.actionUrl || null,
        is_read: false
      });

    if (error) {
      console.error('Erreur création notification:', error);
      throw error;
    }
  } catch (err) {
    console.error('Erreur création notification:', err);
  }
};

/**
 * Crée des notifications en masse pour plusieurs utilisateurs
 */
export const createBulkNotifications = async (
  userIds: string[],
  data: Omit<NotificationData, 'userId'>
): Promise<void> => {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: data.type,
      title: data.title,
      message: data.message,
      action_url: data.actionUrl || null,
      is_read: false
    }));

    const { error } = await supabase
      .from('admin_notifications')
      .insert(notifications);

    if (error) {
      console.error('Erreur création notifications en masse:', error);
      throw error;
    }
  } catch (err) {
    console.error('Erreur création notifications en masse:', err);
  }
};

/**
 * Retourne le nom de l'icône appropriée pour un type de notification
 */
export const getNotificationIconName = (type: string): string => {
  switch (type) {
    // Coffres
    case 'vault_invite':
      return 'HandCoins';
    case 'vault_deposit':
    case 'vault_goal_reached':
      return 'TrendingUp';
    case 'vault_withdrawal':
      return 'TrendingDown';
    case 'vault_invite_accepted':
    case 'vault_member_joined':
      return 'CheckCircle';
    case 'vault_invite_rejected':
      return 'XCircle';
    
    // Prêts
    case 'loan_approved':
    case 'loan_disbursed':
    case 'loan_payment_received':
    case 'loan_completed':
      return 'CheckCircle';
    case 'loan_rejected':
    case 'loan_overdue':
      return 'XCircle';
    case 'loan_payment_due':
      return 'Clock';
    
    // Adhésions
    case 'adhesion_approved':
      return 'CheckCircle';
    case 'adhesion_rejected':
      return 'XCircle';
    case 'adhesion_request':
      return 'UserPlus';
    
    // Transactions
    case 'transaction':
    case 'deposit_received':
    case 'withdrawal_completed':
      return 'DollarSign';
    case 'transaction_failed':
      return 'XCircle';
    
    // Système
    case 'system_alert':
      return 'AlertCircle';
    case 'maintenance':
      return 'Wrench';
    case 'welcome':
      return 'Bell';
    
    default:
      return 'Info';
  }
};

/**
 * Retourne la couleur appropriée pour un type de notification
 */
export const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'vault_invite_accepted':
    case 'vault_deposit':
    case 'vault_goal_reached':
    case 'loan_approved':
    case 'loan_disbursed':
    case 'loan_payment_received':
    case 'loan_completed':
    case 'adhesion_approved':
    case 'transaction':
    case 'deposit_received':
      return 'bg-success/10 border-success/20';
    
    case 'vault_invite_rejected':
    case 'loan_rejected':
    case 'loan_overdue':
    case 'adhesion_rejected':
    case 'transaction_failed':
    case 'system_alert':
      return 'bg-destructive/10 border-destructive/20';
    
    case 'loan_payment_due':
    case 'vault_withdrawal':
    case 'maintenance':
      return 'bg-warning/10 border-warning/20';
    
    default:
      return 'bg-primary/10 border-primary/20';
  }
};

export const NOTIFICATION_TYPES = {
  // Coffres collaboratifs
  VAULT_INVITE: 'vault_invite',
  VAULT_INVITE_ACCEPTED: 'vault_invite_accepted',
  VAULT_INVITE_REJECTED: 'vault_invite_rejected',
  VAULT_MEMBER_JOINED: 'vault_member_joined',
  VAULT_DEPOSIT: 'vault_deposit',
  VAULT_WITHDRAWAL: 'vault_withdrawal',
  VAULT_GOAL_REACHED: 'vault_goal_reached',
  VAULT_WITHDRAWAL_REQUEST: 'vault_withdrawal_request',
  VAULT_WITHDRAWAL_APPROVED: 'vault_withdrawal_approved',
  VAULT_WITHDRAWAL_REJECTED: 'vault_withdrawal_rejected',
  
  // Prêts
  LOAN_APPROVED: 'loan_approved',
  LOAN_REJECTED: 'loan_rejected',
  LOAN_DISBURSED: 'loan_disbursed',
  LOAN_PAYMENT_DUE: 'loan_payment_due',
  LOAN_PAYMENT_RECEIVED: 'loan_payment_received',
  LOAN_OVERDUE: 'loan_overdue',
  LOAN_COMPLETED: 'loan_completed',
  
  // Adhésions
  ADHESION_REQUEST: 'adhesion_request',
  ADHESION_APPROVED: 'adhesion_approved',
  ADHESION_REJECTED: 'adhesion_rejected',
  
  // Transactions
  TRANSACTION_COMPLETED: 'transaction',
  TRANSACTION_FAILED: 'transaction_failed',
  DEPOSIT_RECEIVED: 'deposit_received',
  WITHDRAWAL_COMPLETED: 'withdrawal_completed',
  
  // Système
  SYSTEM_ALERT: 'system_alert',
  MAINTENANCE: 'maintenance',
  WELCOME: 'welcome'
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}

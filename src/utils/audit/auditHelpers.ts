
import { AuditLogEvent, AuditLogCategory, AuditLogSeverity } from './auditLoggerTypes';

/**
 * Utility to create an audit log event with default target_resource
 */
export function createAuditLogEvent(
  action: string,
  category: AuditLogCategory,
  severity: AuditLogSeverity,
  status: 'success' | 'failure' | 'pending',
  userId: string,
  details?: Record<string, any>,
  errorMessage?: string,
  targetResource: string = 'system'
): AuditLogEvent {
  return {
    action,
    category,
    severity,
    status,
    user_id: userId,
    target_resource: targetResource,
    details,
    ...(errorMessage && { error_message: errorMessage })
  };
}

/**
 * Helper for creating transaction-related audit logs
 */
export function createTransactionAuditLog(
  action: string,
  userId: string,
  sfdId: string,
  details: Record<string, any>,
  isSuccess: boolean = true,
  errorMessage?: string
): AuditLogEvent {
  return {
    action,
    category: AuditLogCategory.SFD_OPERATIONS,
    severity: isSuccess ? AuditLogSeverity.INFO : AuditLogSeverity.ERROR,
    status: isSuccess ? 'success' : 'failure',
    user_id: userId,
    target_resource: `sfd:${sfdId}:transactions`,
    details,
    ...(errorMessage && { error_message: errorMessage })
  };
}

/**
 * Helper for creating loan-related audit logs
 */
export function createLoanAuditLog(
  action: string,
  userId: string,
  loanId: string,
  details: Record<string, any>,
  isSuccess: boolean = true,
  errorMessage?: string
): AuditLogEvent {
  return {
    action,
    category: AuditLogCategory.LOAN_OPERATIONS,
    severity: isSuccess ? AuditLogSeverity.INFO : AuditLogSeverity.ERROR,
    status: isSuccess ? 'success' : 'failure',
    user_id: userId,
    target_resource: `loan:${loanId}`,
    details,
    ...(errorMessage && { error_message: errorMessage })
  };
}

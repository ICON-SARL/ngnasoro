
import { supabase } from '@/integrations/supabase/client';
import { AuditLogCategory, AuditLogSeverity } from './auditLoggerTypes';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Retrieves audit logs with optional filtering
 */
export const getAuditLogs = async (options?: {
  userId?: string;
  category?: AuditLogCategory | AuditLogCategory[];
  severity?: AuditLogSeverity | AuditLogSeverity[];
  startDate?: Date;
  endDate?: Date;
  action?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options?.category) {
      if (Array.isArray(options.category)) {
        query = query.in('category', options.category);
      } else {
        query = query.eq('category', options.category);
      }
    }

    if (options?.severity) {
      if (Array.isArray(options.severity)) {
        query = query.in('severity', options.severity);
      } else {
        query = query.eq('severity', options.severity);
      }
    }

    if (options?.action) {
      query = query.ilike('action', `%${options.action}%`);
    }

    if (options?.startDate) {
      query = query.gte('created_at', options.startDate.toISOString());
    }

    if (options?.endDate) {
      query = query.lte('created_at', options.endDate.toISOString());
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return { logs: data, count };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

/**
 * Exports audit logs to CSV format
 */
export const exportAuditLogsToCSV = async (options?: {
  userId?: string;
  category?: AuditLogCategory | AuditLogCategory[];
  startDate?: Date;
  endDate?: Date;
  severity?: AuditLogSeverity | AuditLogSeverity[];
}) => {
  try {
    const { logs } = await getAuditLogs({
      ...options,
      limit: 1000
    });

    if (!logs || logs.length === 0) {
      return { success: false, message: 'Aucun log d\'audit trouvé' };
    }

    // Transform data for CSV
    const csvData = logs.map(log => ({
      'Date': format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: fr }),
      'Utilisateur': log.user_id || '-',
      'Action': log.action,
      'Catégorie': log.category,
      'Sévérité': log.severity,
      'Statut': log.status,
      'Ressource': log.target_resource || '-',
      'Message d\'erreur': log.error_message || '-'
    }));

    // Convert to CSV string
    const headers = Object.keys(csvData[0]);
    const csvString = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        // Handle special characters and commas in CSV
        const value = String(row[header] || '');
        return value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    return {
      success: true,
      filename: `audit_logs_${format(new Date(), 'yyyyMMdd')}.csv`,
      csvString
    };
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    return { success: false, message: 'Erreur lors de l\'exportation des logs d\'audit' };
  }
};

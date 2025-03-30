
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { getAuditLogs } from '@/utils/audit/auditLoggerCore';
import { FileText, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditLogEntry {
  id: string;
  created_at: string;
  user_id: string;
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  status: string;
  error_message?: string;
}

export function AuditLogsSummary() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { logs: auditLogs } = await getAuditLogs({
          limit: 5,
          severity: [AuditLogSeverity.ERROR, AuditLogSeverity.WARNING, AuditLogSeverity.CRITICAL]
        });
        
        setLogs(auditLogs as AuditLogEntry[]);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLogs();
  }, [user]);
  
  const getSeverityBadge = (severity: AuditLogSeverity) => {
    switch (severity) {
      case AuditLogSeverity.CRITICAL:
        return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
      case AuditLogSeverity.ERROR:
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
      case AuditLogSeverity.WARNING:
        return <Badge className="bg-yellow-100 text-yellow-800">Avertissement</Badge>;
      case AuditLogSeverity.INFO:
      default:
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
    }
  };
  
  const getSeverityIcon = (severity: AuditLogSeverity) => {
    switch (severity) {
      case AuditLogSeverity.CRITICAL:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case AuditLogSeverity.ERROR:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case AuditLogSeverity.WARNING:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case AuditLogSeverity.INFO:
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Alertes de Sécurité</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-sm"
          onClick={() => navigate('/audit-logs')}
        >
          <FileText className="h-4 w-4 mr-1" />
          Voir tous les logs
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Info className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p>Aucune alerte de sécurité récente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100">
                <div className="mt-0.5">
                  {getSeverityIcon(log.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-medium text-sm">{log.action}</div>
                    {getSeverityBadge(log.severity)}
                  </div>
                  {log.error_message && (
                    <p className="text-xs text-gray-500 mt-1">{log.error_message}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-1 flex justify-between">
                    <span>ID: {log.user_id.substring(0, 8)}...</span>
                    <span>{format(new Date(log.created_at), 'dd MMM HH:mm', { locale: fr })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AuditLogsSummary;

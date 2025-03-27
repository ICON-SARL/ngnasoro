
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditLog {
  id: string;
  action: string;
  user_id?: string;
  category: string;
  severity: string;
  status: string;
  details?: Record<string, any>;
  error_message?: string;
  created_at: string;
  target_resource?: string;
}

interface AuditLogTableProps {
  logs: AuditLog[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  // Format the timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'dd MMM yyyy, HH:mm', { locale: fr });
  };
  
  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Avertissement</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
      case 'critical':
        return <Badge className="bg-purple-100 text-purple-800">Critique</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{severity}</Badge>;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return (
        <div className="flex items-center space-x-1">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Succès</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1">
          <XCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-600">Échec</span>
        </div>
      );
    }
  };
  
  // Format the action name for display
  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Horodatage</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Administrateur</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Sévérité</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="max-w-[200px]">Détails</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center text-xs">
                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                  {formatTimestamp(log.created_at)}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {formatActionName(log.action)}
              </TableCell>
              <TableCell>
                {log.user_id ? log.user_id.substring(0, 8) : 'Système'}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {log.category}
                </Badge>
              </TableCell>
              <TableCell>
                {getSeverityBadge(log.severity)}
              </TableCell>
              <TableCell>
                {getStatusBadge(log.status)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {log.error_message ? (
                  <span className="text-red-600">{log.error_message}</span>
                ) : (
                  log.details ? (
                    <span className="text-xs">{JSON.stringify(log.details)}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AuditLogSeverity } from '@/utils/auditLogger';
import { AuditLogTableProps } from './types';

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  // Get severity badge styling
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case AuditLogSeverity.INFO:
        return <Badge variant="outline" className="bg-blue-50 text-blue-600">Info</Badge>;
      case AuditLogSeverity.WARNING:
        return <Badge variant="outline" className="bg-amber-50 text-amber-600">Avertissement</Badge>;
      case AuditLogSeverity.ERROR:
        return <Badge variant="outline" className="bg-red-50 text-red-600">Erreur</Badge>;
      case AuditLogSeverity.CRITICAL:
        return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };
  
  // Get status badge styling
  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return <Badge className="bg-green-100 text-green-800">Succès</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Échec</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Chargement des journaux d'audit...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Aucun journal d'audit trouvé avec les critères de recherche actuels.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Sévérité</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Détails</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
              <TableCell className="font-medium">{log.action}</TableCell>
              <TableCell className="truncate max-w-[100px]">{log.user_id}</TableCell>
              <TableCell>{log.category}</TableCell>
              <TableCell>{getSeverityBadge(log.severity)}</TableCell>
              <TableCell>{getStatusBadge(log.status)}</TableCell>
              <TableCell className="truncate max-w-[200px]">
                {log.details ? JSON.stringify(log.details) : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

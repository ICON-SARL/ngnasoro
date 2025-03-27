
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
import { SfdAuditLog } from '../types/sfd-types';
import { Skeleton } from '@/components/ui/skeleton';
import { AuditLogTableProps } from './types';
import { 
  AlertCircle, 
  AlertTriangle, 
  Check, 
  Info, 
  Shield, 
  User, 
  Database, 
  Settings, 
  Building, 
  Users, 
  Smartphone,
  X,
} from 'lucide-react';

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Aucune entrée dans le journal d'audit trouvée.
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sfd_operations':
        return <Building className="h-4 w-4" />;
      case 'user_management':
        return <Users className="h-4 w-4" />;
      case 'data_access':
        return <Database className="h-4 w-4" />;
      case 'configuration':
        return <Settings className="h-4 w-4" />;
      case 'authentication':
        return <Shield className="h-4 w-4" />;
      case 'token_management':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'success' 
      ? <Check className="h-4 w-4 text-green-500" /> 
      : <X className="h-4 w-4 text-red-500" />;
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'sfd_operations':
        return 'Opérations SFD';
      case 'user_management':
        return 'Gestion Utilisateurs';
      case 'data_access':
        return 'Accès aux données';
      case 'configuration':
        return 'Configuration';
      case 'authentication':
        return 'Authentification';
      case 'token_management':
        return 'Gestion des tokens';
      default:
        return category;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">{getSeverityIcon(severity)} Info</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">{getSeverityIcon(severity)} Avertissement</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700">{getSeverityIcon(severity)} Erreur</Badge>;
      case 'critical':
        return <Badge variant="outline" className="bg-red-100 text-red-800 font-medium">{getSeverityIcon(severity)} Critique</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

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
            <TableHead>Date</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Sévérité</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Détails</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id} className="group">
              <TableCell className="whitespace-nowrap">
                {new Date(log.created_at).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{log.user_id ? log.user_id.substring(0, 8) : 'Système'}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{formatActionName(log.action)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(log.category)}
                  <span>{getCategoryLabel(log.category)}</span>
                </div>
              </TableCell>
              <TableCell>{getSeverityBadge(log.severity)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(log.status)}
                  <span className={log.status === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {log.status === 'success' ? 'Succès' : 'Échec'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-[300px] truncate group-hover:whitespace-normal">
                {log.details && typeof log.details === 'object' 
                  ? Object.entries(log.details)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')
                  : log.error_message || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

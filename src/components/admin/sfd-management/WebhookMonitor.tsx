import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  ExternalLink 
} from 'lucide-react';
import { useWebhookMonitor } from './hooks/useWebhookMonitor';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { logAuditEvent } from '@/utils/audit';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

// This component would be connected to real data in a production environment
export function WebhookMonitor() {
  const { 
    webhooks, 
    isLoading, 
    error, 
    refreshWebhooks,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    filteredWebhooks
  } = useWebhookMonitor();

  useEffect(() => {
    // Log component mount for audit purposes
    logAuditEvent({
      category: AuditLogCategory.MONITORING,
      action: 'view_webhook_monitor',
      status: 'success',
      severity: AuditLogSeverity.INFO,
      metadata: {
        component: 'WebhookMonitor',
        action: 'component_mounted'
      }
    });
  }, []);

  // Function to determine badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monitoring des Webhooks</CardTitle>
              <CardDescription>
                Surveillez les webhooks Mobile Money et leurs statuts
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              disabled={isLoading}
              onClick={() => refreshWebhooks()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ID, fournisseur ou référence..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="success">Succès</SelectItem>
                <SelectItem value="failed">Échec</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Statut</TableHead>
                    <TableHead>ID du Webhook</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Reçu</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWebhooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Aucun webhook trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWebhooks.map((webhook) => (
                      <TableRow key={webhook.id}>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(webhook.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(webhook.status)}
                              {webhook.status === 'success' ? 'Succès' : 
                               webhook.status === 'failed' ? 'Échec' : 
                               webhook.status === 'pending' ? 'En attente' : webhook.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{webhook.id.substring(0, 8)}</TableCell>
                        <TableCell>{webhook.provider}</TableCell>
                        <TableCell>{webhook.type}</TableCell>
                        <TableCell className="font-mono text-xs">{webhook.reference}</TableCell>
                        <TableCell>
                          {webhook.receivedAt ? 
                            formatDistanceToNow(new Date(webhook.receivedAt), { 
                              addSuffix: true, locale: fr 
                            }) : 
                            '-'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              logAuditEvent({
                                category: AuditLogCategory.MONITORING,
                                action: 'view_webhook_details',
                                status: 'success',
                                severity: AuditLogSeverity.INFO,
                                metadata: {
                                  webhook_id: webhook.id,
                                  provider: webhook.provider
                                }
                              });
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
            <p>Total: {webhooks.length} webhook(s)</p>
            <p>
              Mis à jour: {new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import React, { useState } from 'react';
import { useAuditLogs, AuditLog, AuditLogFilters } from '@/hooks/useAuditLogs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  CalendarIcon, 
  Download, 
  Filter, 
  Info, 
  Loader2, 
  RefreshCw, 
  Shield, 
  UserIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export function AuditLogsManager() {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const { logs, isLoading, isExporting, refetch, exportLogsToCSV } = useAuditLogs(filters);
  
  const handleExport = async () => {
    try {
      const csvContent = await exportLogsToCSV();
      
      // Create a Blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };
  
  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const resetFilters = () => {
    setFilters({});
  };
  
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'AUTHENTICATION': return 'bg-blue-100 text-blue-800';
      case 'FINANCIAL': return 'bg-green-100 text-green-800';
      case 'ADMINISTRATION': return 'bg-purple-100 text-purple-800';
      case 'DATA_ACCESS': return 'bg-yellow-100 text-yellow-800';
      case 'SECURITY': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'INFO': return 'bg-blue-100 text-blue-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'CRITICAL': return 'bg-red-700 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failure': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Journal d'Audit</CardTitle>
              <CardDescription>
                Consultez l'historique des activités et opérations sur la plateforme
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={refetch} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exportation...' : 'Exporter en CSV'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Filtres</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Select 
                  value={filters.category as string || ''} 
                  onValueChange={(value) => handleFilterChange('category', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les catégories</SelectItem>
                    <SelectItem value="AUTHENTICATION">Authentification</SelectItem>
                    <SelectItem value="DATA_ACCESS">Accès aux données</SelectItem>
                    <SelectItem value="ADMINISTRATION">Administration</SelectItem>
                    <SelectItem value="SECURITY">Sécurité</SelectItem>
                    <SelectItem value="FINANCIAL">Financier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={filters.severity as string || ''} 
                  onValueChange={(value) => handleFilterChange('severity', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sévérité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les sévérités</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARNING">Avertissement</SelectItem>
                    <SelectItem value="ERROR">Erreur</SelectItem>
                    <SelectItem value="CRITICAL">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={filters.status || ''} 
                  onValueChange={(value) => handleFilterChange('status', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les statuts</SelectItem>
                    <SelectItem value="success">Succès</SelectItem>
                    <SelectItem value="failure">Échec</SelectItem>
                    <SelectItem value="pending">En cours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.startDate ? (
                        format(new Date(filters.startDate), 'dd/MM/yyyy')
                      ) : (
                        "Date de début"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.startDate ? new Date(filters.startDate) : undefined}
                      onSelect={(date) => handleFilterChange('startDate', date ? date.toISOString() : undefined)}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="ghost" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
          
          {/* Logs Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des journaux d'audit...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center p-8 rounded-md bg-muted/20">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Aucun journal d'audit trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Sévérité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Ressource cible</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: AuditLog) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <UserIcon className="h-3.5 w-3.5 mr-1 text-gray-500" />
                          {log.user_email || log.user_id}
                        </div>
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(getCategoryBadgeColor(log.category))}
                        >
                          {log.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(getSeverityBadgeColor(log.severity))}
                        >
                          {log.severity === 'CRITICAL' ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : log.severity === 'ERROR' ? (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          ) : log.severity === 'WARNING' ? (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Info className="h-3 w-3 mr-1" />
                          )}
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(getStatusBadgeColor(log.status))}
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate" title={log.target_resource}>
                        {log.target_resource}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

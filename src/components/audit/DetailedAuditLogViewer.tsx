import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import { 
  Shield, 
  Download, 
  Search, 
  Filter, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  XCircle,
  FileDown,
  RefreshCw
} from 'lucide-react';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { PERMISSIONS } from '@/utils/auth/roleTypes';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  details?: Record<string, any>;
  ip_address?: string;
  device_info?: string;
  target_resource?: string;
  status: 'success' | 'failure';
  error_message?: string;
  created_at: string;
}

interface DetailedAuditLogViewerProps {
  title?: string;
  description?: string;
  defaultCategory?: AuditLogCategory;
  pageSize?: number;
  showFilters?: boolean;
  showExport?: boolean;
  userIdFilter?: string;
}

export const DetailedAuditLogViewer: React.FC<DetailedAuditLogViewerProps> = ({
  title = "Journal d'audit",
  description = "Historique des actions système pour la sécurité et la conformité",
  defaultCategory,
  pageSize = 10,
  showFilters = true,
  showExport = true,
  userIdFilter
}) => {
  const { hasPermission } = usePermissions();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [page, setPage] = useState(1);
  
  const [filters, setFilters] = useState({
    category: defaultCategory || '',
    severity: '',
    status: '',
    searchTerm: '',
    dateRange: {
      from: undefined,
      to: undefined
    }
  });

  const canViewAuditLogs = hasPermission(PERMISSIONS.VIEW_AUDIT_LOGS);
  const canManageAuditLogs = hasPermission(PERMISSIONS.MANAGE_AUDIT_LOGS);

  useEffect(() => {
    if (!canViewAuditLogs) {
      setLogs([]);
      setLoading(false);
      return;
    }
    
    fetchLogs();
  }, [page, userIdFilter, canViewAuditLogs]);
  
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const options: any = {
        page,
        pageSize,
        sortBy: 'created_at',
        sortOrder: 'desc',
      };
      
      if (filters.category) options.category = filters.category;
      if (filters.severity) options.severity = filters.severity;
      if (filters.status) options.status = filters.status;
      if (filters.dateRange.from) options.startDate = filters.dateRange.from.toISOString();
      if (filters.dateRange.to) options.endDate = filters.dateRange.to.toISOString();
      if (userIdFilter) options.userId = userIdFilter;
      
      const fetchedLogs = await getAuditLogs(options);
      setLogs(fetchedLogs);
      
      setTotalCount(fetchedLogs.length > 0 ? pageSize * 5 : 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplyFilters = () => {
    setPage(1);
    fetchLogs();
  };
  
  const handleResetFilters = () => {
    setFilters({
      category: defaultCategory || '',
      severity: '',
      status: '',
      searchTerm: '',
      dateRange: {
        from: undefined,
        to: undefined
      }
    });
    setPage(1);
    fetchLogs();
  };
  
  const handleExportLogs = () => {
    const headers = ['Date', 'Action', 'Catégorie', 'Sévérité', 'Statut', 'Utilisateur', 'Ressource', 'Détails'];
    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.action,
        log.category,
        log.severity,
        log.status,
        log.user_id,
        log.target_resource || '',
        JSON.stringify(log.details || {}).replace(/,/g, ';')
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getSeverityIcon = (severity: AuditLogSeverity) => {
    switch (severity) {
      case AuditLogSeverity.INFO:
        return <Info className="h-4 w-4 text-blue-500" />;
      case AuditLogSeverity.WARNING:
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case AuditLogSeverity.ERROR:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case AuditLogSeverity.CRITICAL:
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getSeverityBadge = (severity: AuditLogSeverity) => {
    switch (severity) {
      case AuditLogSeverity.INFO:
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
      case AuditLogSeverity.WARNING:
        return <Badge className="bg-amber-100 text-amber-800">Attention</Badge>;
      case AuditLogSeverity.ERROR:
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
      case AuditLogSeverity.CRITICAL:
        return <Badge className="bg-purple-100 text-purple-800">Critique</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };
  
  const getStatusIcon = (status: 'success' | 'failure') => {
    return status === 'success' 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />;
  };
  
  const getFormattedDetails = (details: Record<string, any> | undefined) => {
    if (!details) return null;
    
    if (details.sfd_name && details.amount) {
      return (
        <div>
          <span className="font-medium">{details.sfd_name}</span>
          <span> - {Number(details.amount).toLocaleString()} FCFA</span>
          {details.purpose && <div className="text-xs text-gray-500 mt-1">{details.purpose}</div>}
        </div>
      );
    }
    
    return (
      <div>
        {Object.entries(details).map(([key, value]) => {
          if (['timestamp', 'id', '_id'].includes(key)) return null;
          
          return (
            <div key={key} className="text-xs">
              <span className="font-medium">{key}:</span> {String(value)}
            </div>
          );
        })}
      </div>
    );
  };
  
  if (!canViewAuditLogs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Shield className="h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium">Accès non autorisé</h3>
            <p className="mt-2 text-sm text-gray-500">
              Vous n'avez pas les permissions nécessaires pour voir les journaux d'audit.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {showFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFiltersVisible(!filtersVisible)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtres
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchLogs}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualiser
            </Button>
            
            {showExport && canManageAuditLogs && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportLogs}
              >
                <FileDown className="h-4 w-4 mr-1" />
                Exporter
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filtersVisible && (
          <div className="border rounded-md p-4 mb-6 bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Catégorie</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les catégories</SelectItem>
                    {Object.values(AuditLogCategory).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Sévérité</label>
                <Select
                  value={filters.severity}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les sévérités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les sévérités</SelectItem>
                    {Object.values(AuditLogSeverity).map(severity => (
                      <SelectItem key={severity} value={severity}>{severity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Statut</label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les statuts</SelectItem>
                    <SelectItem value="success">Succès</SelectItem>
                    <SelectItem value="failure">Échec</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Période</label>
                <DateRangePicker
                  date={filters.dateRange}
                  setDate={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Réinitialiser
              </Button>
              <Button size="sm" onClick={handleApplyFilters}>
                Appliquer
              </Button>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <RefreshCw className="animate-spin h-6 w-6 text-primary" />
            <span className="ml-2">Chargement des logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Aucun log trouvé</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Aucune entrée d'audit ne correspond à vos critères.
            </p>
          </div>
        ) : (
          <>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Horodatage</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Détails</TableHead>
                    <TableHead className="w-[100px]">Sévérité</TableHead>
                    <TableHead className="w-[100px]">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.action}</div>
                        {log.target_resource && (
                          <div className="text-xs text-muted-foreground">
                            {log.target_resource}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.category.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getFormattedDetails(log.details)}
                        {log.error_message && (
                          <div className="text-xs text-red-600 mt-1">
                            {log.error_message}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getSeverityIcon(log.severity)}
                          <span className="ml-1.5">
                            {getSeverityBadge(log.severity)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(log.status)}
                          <span className="ml-1.5">
                            <Badge className={
                              log.status === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }>
                              {log.status === 'success' ? 'Succès' : 'Échec'}
                            </Badge>
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalCount > pageSize && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      {page === 1 ? (
                        <PaginationPrevious 
                          onClick={() => {}} 
                          aria-disabled="true"
                          className="pointer-events-none opacity-50"
                        />
                      ) : (
                        <PaginationPrevious 
                          onClick={() => setPage(p => Math.max(p - 1, 1))} 
                        />
                      )}
                    </PaginationItem>
                    
                    {Array.from({ length: Math.ceil(totalCount / pageSize) }, (_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink 
                          isActive={page === i + 1}
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      {page === Math.ceil(totalCount / pageSize) ? (
                        <PaginationNext 
                          onClick={() => {}} 
                          aria-disabled="true"
                          className="pointer-events-none opacity-50"
                        />
                      ) : (
                        <PaginationNext 
                          onClick={() => setPage(p => Math.min(p + 1, Math.ceil(totalCount / pageSize)))} 
                        />
                      )}
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

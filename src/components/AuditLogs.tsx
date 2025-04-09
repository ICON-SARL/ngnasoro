import React, { useState, useEffect } from 'react';
import { AuditLogCategory, AuditLogSeverity, AuditLogFilterOptions, AuditLogEvent } from '@/utils/audit/auditLoggerTypes';
import { getAuditLogs } from '@/utils/audit/auditLoggerCore';
import { ExtendedUser } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Download, Filter, RefreshCw, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AuditLog extends AuditLogEvent {
  id: string;
  created_at: string;
}

export const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilterOptions>({
    category: undefined,
    severity: undefined,
    startDate: '',
    endDate: '',
    status: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filterOptions: AuditLogFilterOptions = {
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.severity ? { severity: filters.severity } : {}),
        ...(filters.startDate ? { startDate: filters.startDate } : {}),
        ...(filters.endDate ? { endDate: filters.endDate } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      };
      
      const response = await getAuditLogs(filterOptions);
      const typedLogs = response.logs.map(log => ({
        ...log,
        id: (log as any).id || '',
        created_at: (log as any).created_at || new Date().toISOString()
      })) as AuditLog[];
      
      setLogs(typedLogs);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilterChange = (key: keyof AuditLogFilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      category: undefined,
      severity: undefined,
      startDate: '',
      endDate: '',
      status: undefined,
    });
    fetchLogs();
  };

  const getSeverityColor = (severity: AuditLogSeverity) => {
    switch (severity) {
      case AuditLogSeverity.INFO:
        return 'bg-blue-100 text-blue-800';
      case AuditLogSeverity.WARNING:
        return 'bg-yellow-100 text-yellow-800';
      case AuditLogSeverity.ERROR:
        return 'bg-red-100 text-red-800';
      case AuditLogSeverity.CRITICAL:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: AuditLogCategory) => {
    switch (category) {
      case AuditLogCategory.AUTHENTICATION:
        return 'bg-blue-50 text-blue-700';
      case AuditLogCategory.DATA_ACCESS:
        return 'bg-green-50 text-green-700';
      case AuditLogCategory.TOKEN_MANAGEMENT:
        return 'bg-purple-50 text-purple-700';
      case AuditLogCategory.USER_MANAGEMENT:
        return 'bg-indigo-50 text-indigo-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Action', 'Category', 'Severity', 'Status', 'User ID', 'Target', 'Details'].join(','),
      ...logs.map(log => [
        log.created_at,
        log.action,
        log.category,
        log.severity,
        log.status,
        log.user_id || '',
        log.target_resource || '',
        JSON.stringify(log.details || {}).replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `audit-logs-${new Date().toISOString()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Journal d'Audit de Sécurité
          </h2>
          <p className="text-sm text-muted-foreground">
            Suivi des activités importantes du système pour la conformité et la sécurité
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtres
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualiser
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportLogs}
          >
            <Download className="h-4 w-4 mr-1" />
            Exporter
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <Select 
                value={filters.category as string} 
                onValueChange={(val) => handleFilterChange('category', val ? val as AuditLogCategory : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  {Object.values(AuditLogCategory).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Sévérité</label>
              <Select 
                value={filters.severity as string} 
                onValueChange={(val) => handleFilterChange('severity', val ? val as AuditLogSeverity : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les sévérités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les sévérités</SelectItem>
                  {Object.values(AuditLogSeverity).map(sev => (
                    <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select 
                value={filters.status as string || ""} 
                onValueChange={(val) => handleFilterChange('status', val as 'success' | 'failure' | 'pending' || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                  <SelectItem value="failure">Échec</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Date de début</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(new Date(filters.startDate), 'PPP') : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate ? new Date(filters.startDate) : undefined}
                    onSelect={date => handleFilterChange('startDate', date ? date.toISOString() : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium">Date de fin</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(new Date(filters.endDate), 'PPP') : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate ? new Date(filters.endDate) : undefined}
                    onSelect={date => handleFilterChange('endDate', date ? date.toISOString() : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={handleClearFilters}>
              Réinitialiser
            </Button>
            <Button onClick={handleApplyFilters}>
              Appliquer les filtres
            </Button>
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Chargement des logs d'audit...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Aucun log d'audit trouvé pour ces critères.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horodatage</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Sévérité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{log.action}</div>
                      {log.target_resource && (
                        <div className="text-xs text-gray-500">
                          {log.target_resource}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(log.category as AuditLogCategory)}>
                      {log.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(log.severity as AuditLogSeverity)}>
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={log.status === 'success' ? 'default' : 'destructive'}
                      className={log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {log.status === 'success' ? 'Succès' : 'Échec'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {log.error_message ? (
                        <span className="text-red-600">{log.error_message}</span>
                      ) : (
                        log.details ? (
                          <span className="text-xs text-gray-600 font-mono">
                            {JSON.stringify(log.details)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

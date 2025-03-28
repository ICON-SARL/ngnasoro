
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  AlertCircle, 
  CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Download, 
  Filter, 
  Search, 
  Activity 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

interface AuditLogEntry {
  id: string;
  created_at: string;
  user_id: string | null;
  action: string;
  category: string;
  severity: string;
  status: string;
  details: any;
  error_message: string | null;
  target_resource: string | null;
  ip_address: string | null;
  device_info: string | null;
}

const DetailedAuditLogViewer = () => {
  // State for filters
  const [filters, setFilters] = useState({
    category: '',
    severity: '',
    status: '',
    searchTerm: '',
    dateRange: {
      from: undefined,
      to: undefined
    }
  });
  
  // State for logs and pagination
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const logsPerPage = 10;

  // Categories for filtering
  const categories = Object.values(AuditLogCategory);
  const severities = Object.values(AuditLogSeverity);
  const statuses = ['success', 'failure', 'pending'];

  // Load logs from Supabase
  const fetchLogs = async () => {
    setIsLoading(true);
    
    try {
      // Build the query with filters
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.searchTerm) {
        query = query.or(`action.ilike.%${filters.searchTerm}%,target_resource.ilike.%${filters.searchTerm}%,error_message.ilike.%${filters.searchTerm}%`);
      }
      
      // Apply date range filter
      if (filters.dateRange.from) {
        const fromDate = new Date(filters.dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        query = query.gte('created_at', fromDate.toISOString());
      }
      
      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', toDate.toISOString());
      }
      
      // Add pagination
      const from = (currentPage - 1) * logsPerPage;
      const to = from + logsPerPage - 1;
      
      // Execute the query with pagination
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      setLogs(data || []);
      setTotalLogs(count || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch logs when filters or pagination changes
  useEffect(() => {
    fetchLogs();
  }, [filters, currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Format the date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm:ss', { locale: fr });
  };

  // Get severity badge class
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'CRITICAL':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Pagination controls
  const totalPages = Math.ceil(totalLogs / logsPerPage);
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Export logs as CSV
  const exportLogs = () => {
    // Implementation for exporting logs
    alert('Export functionality would be implemented here');
  };

  // View log details
  const viewLogDetails = (log: AuditLogEntry) => {
    setSelectedLog(log);
  };

  // Handle date range change with proper type handling
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        from: range?.from,
        to: range?.to
      }
    }));
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Catégorie</label>
              <Select 
                value={filters.category} 
                onValueChange={(value) => setFilters({...filters, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Sévérité</label>
              <Select 
                value={filters.severity} 
                onValueChange={(value) => setFilters({...filters, severity: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les sévérités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les sévérités</SelectItem>
                  {severities.map((severity) => (
                    <SelectItem key={severity} value={severity}>{severity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Statut</label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({...filters, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Période</label>
              <DatePickerWithRange
                date={filters.dateRange}
                setDate={handleDateRangeChange}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Recherche</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Journal d'Audit
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left">Date et Heure</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Catégorie</th>
                    <th className="px-4 py-3 text-left">Sévérité</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-40" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
                        <td className="px-4 py-3 text-right"><Skeleton className="h-5 w-12 ml-auto" /></td>
                      </tr>
                    ))
                  ) : logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-4 py-3">{log.action}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{log.category}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getSeverityBadge(log.severity)}>
                            {log.severity}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusBadge(log.status)}>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => viewLogDetails(log)}
                          >
                            Détails
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-500">Aucun log d'audit ne correspond à vos critères</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {logs.length > 0 && (
              <div className="px-4 py-2 border-t flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Affichage {Math.min((currentPage - 1) * logsPerPage + 1, totalLogs)} - {Math.min(currentPage * logsPerPage, totalLogs)} sur {totalLogs} entrées
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage <= 1}
                    aria-disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm" 
                    onClick={goToNextPage}
                    disabled={currentPage >= totalPages}
                    aria-disabled={currentPage >= totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Log Details Modal would go here */}
      {selectedLog && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Détails du Log #{selectedLog.id.slice(0, 8)}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] rounded-md border p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Informations Générales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date et Heure</p>
                      <p className="font-medium">{formatDate(selectedLog.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID Utilisateur</p>
                      <p className="font-medium">{selectedLog.user_id || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Action</p>
                      <p className="font-medium">{selectedLog.action}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ressource Cible</p>
                      <p className="font-medium">{selectedLog.target_resource || 'Non spécifié'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Métadonnées</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Catégorie</p>
                      <Badge variant="outline">{selectedLog.category}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sévérité</p>
                      <Badge className={getSeverityBadge(selectedLog.severity)}>
                        {selectedLog.severity}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <Badge className={getStatusBadge(selectedLog.status)}>
                        {selectedLog.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {selectedLog.error_message && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Message d'Erreur</h3>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800">
                      {selectedLog.error_message}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Détails Supplémentaires</h3>
                  <pre className="bg-gray-50 rounded-md p-3 overflow-x-auto text-sm">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
                
                {(selectedLog.ip_address || selectedLog.device_info) && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Informations Techniques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLog.ip_address && (
                        <div>
                          <p className="text-sm text-gray-500">Adresse IP</p>
                          <p className="font-medium">{selectedLog.ip_address}</p>
                        </div>
                      )}
                      {selectedLog.device_info && (
                        <div>
                          <p className="text-sm text-gray-500">Informations de l'Appareil</p>
                          <p className="font-medium">{selectedLog.device_info}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setSelectedLog(null)}>
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DetailedAuditLogViewer;
